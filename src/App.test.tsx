import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import App from './App'
import { server } from './test/setup'

function renderApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>,
  )
}

describe('Meridian Banking Application', () => {
  it('E4.3: a failed dashboard request shows the error, and Retry loads it', async () => {
    // Override accounts endpoint to fail
    server.use(
      http.get('*/api/accounts', () =>
        HttpResponse.json(
          { error: { code: 'INTERNAL_ERROR', message: 'Down' } },
          { status: 500 },
        ),
      ),
    )

    const user = userEvent.setup()
    renderApp()

    // Dashboard error is displayed
    await waitFor(
      () => {
        expect(
          screen.getByText("We couldn't load your dashboard."),
        ).toBeInTheDocument()
      },
      { timeout: 3000 },
    )

    const retryButton = screen.getByRole('button', { name: 'Retry' })
    expect(retryButton).toBeInTheDocument()

    // Restore normal mock API behavior
    server.resetHandlers()

    // Click retry
    await user.click(retryButton)

    // Dashboard successfully loads
    await waitFor(
      () => {
        expect(
          screen.getByRole('heading', { name: 'Good evening, Ava' }),
        ).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  })

  it('E4.1: an amount over the balance shows the error and sends no request', async () => {
    const user = userEvent.setup()

    // Spy on transfer POST requests
    const transferRequestSpy = vi.fn()
    server.use(
      http.post('*/api/transfers', async () => {
        transferRequestSpy()
        return HttpResponse.json({}, { status: 201 })
      }),
    )

    renderApp()

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Good evening, Ava' })).toBeInTheDocument()
    })

    // Open Transfer dialog
    const openTransferBtns = screen.getAllByRole('button', { name: /new transfer/i })
    await user.click(openTransferBtns[0])

    expect(screen.getByRole('heading', { name: 'Who are you sending to?' })).toBeInTheDocument()

    // Step 1: Select saved payee Jamie Tan
    const payeeRadio = await screen.findByRole('radio', { name: /Jamie Tan/i })
    await user.click(payeeRadio)

    const continueBtn = screen.getByRole('button', { name: 'Continue' })
    await user.click(continueBtn)

    // Step 2: Amount step
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'How much?' })).toBeInTheDocument()
    })

    const amountInput = screen.getByPlaceholderText('0.00')

    // Enter an amount over the balance: 4500.00
    await user.type(amountInput, '4500.00')

    const amountContinueBtn = screen.getByRole('button', { name: 'Continue' })
    await user.click(amountContinueBtn)

    // Check if error is displayed using regex covering non-breaking space
    await waitFor(() => {
      expect(
        screen.getByText(
          new RegExp(
            `Amount can't be more than your available balance \\(SGD[\\s\\u00A0]4,280\\.55\\)\\.`,
          ),
        ),
      ).toBeInTheDocument()
    })

    // Verify that NO transfer request was ever sent to the server
    expect(transferRequestSpy).not.toHaveBeenCalled()
  })

  it('E4.2: a successful transfer shows the success screen and the dashboard updates', async () => {
    const user = userEvent.setup()
    renderApp()

    // Wait for dashboard to load
    await waitFor(() => {
      expect(screen.getByText('Everyday Checking')).toBeInTheDocument()
    })

    // Check initial checking balance (4,280.55)
    expect(screen.getByText(/4,280\.55/)).toBeInTheDocument()

    // Open Transfer dialog
    const openTransferBtns = screen.getAllByRole('button', { name: /new transfer/i })
    await user.click(openTransferBtns[0])

    // Step 1: Pick Jamie Tan
    const payeeRadio = await screen.findByRole('radio', { name: /Jamie Tan/i })
    await user.click(payeeRadio)
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    // Step 2: Enter valid amount and note
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'How much?' })).toBeInTheDocument()
    })

    await user.type(screen.getByPlaceholderText('0.00'), '120.00')
    await user.type(screen.getByPlaceholderText('e.g. Dinner'), 'Team Lunch')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    // Step 3: Review step
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Check the details' })).toBeInTheDocument()
    })

    expect(screen.getByText(/Jamie Tan/)).toBeInTheDocument()
    expect(screen.getByText('Team Lunch')).toBeInTheDocument()

    // Confirm transfer
    const confirmBtn = screen.getByRole('button', { name: 'Confirm transfer' })
    await user.click(confirmBtn)

    // Success screen appears
    await waitFor(
      () => {
        expect(screen.getByRole('heading', { name: 'Transfer sent' })).toBeInTheDocument()
      },
      { timeout: 3000 },
    )

    expect(screen.getByText('The money should arrive within minutes.')).toBeInTheDocument()
    expect(screen.getByText(/TRF-/)).toBeInTheDocument()

    // Click "Back to dashboard"
    const backBtn = screen.getByRole('button', { name: 'Back to dashboard' })
    await user.click(backBtn)

    // Dialog is closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    // Dashboard shows updated balance (4,280.55 - 120 = 4,160.55)
    await waitFor(() => {
      expect(screen.getByText(/4,160\.55/)).toBeInTheDocument()
    })
  })

  it('T7: displays error on review step when transfer fails and keeps data intact', async () => {
    const user = userEvent.setup()
    renderApp()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Good evening, Ava' })).toBeInTheDocument()
    })

    const openTransferBtns = screen.getAllByRole('button', { name: /new transfer/i })
    await user.click(openTransferBtns[0])

    const payeeRadio = await screen.findByRole('radio', { name: /Jamie Tan/i })
    await user.click(payeeRadio)
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'How much?' })).toBeInTheDocument()
    })

    // Using #fail test hook per API contract
    await user.type(screen.getByPlaceholderText('0.00'), '50.00')
    await user.type(screen.getByPlaceholderText('e.g. Dinner'), 'Test #fail')
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Check the details' })).toBeInTheDocument()
    })

    const confirmBtn = screen.getByRole('button', { name: 'Confirm transfer' })
    await user.click(confirmBtn)

    // Stays on review step with alert banner
    await waitFor(
      () => {
        expect(
          screen.getByText(
            "Something went wrong. Your money hasn't left your account. Try again.",
          ),
        ).toBeInTheDocument()
      },
      { timeout: 3000 },
    )

    // Form data still intact on review step
    expect(screen.getByText('Test #fail')).toBeInTheDocument()
  })

  it('filters transactions by search query', async () => {
    const user = userEvent.setup()
    renderApp()

    await waitFor(() => {
      expect(screen.getByText('FairPrice Finest')).toBeInTheDocument()
    })

    const searchInput = screen.getByPlaceholderText('Search transactions')
    await user.type(searchInput, 'Grab')

    expect(screen.getByText('Grab')).toBeInTheDocument()
    expect(screen.queryByText('FairPrice Finest')).not.toBeInTheDocument()

    const clearBtn = screen.getByRole('button', { name: 'Clear search input' })
    await user.click(clearBtn)

    expect(screen.getByText('FairPrice Finest')).toBeInTheDocument()
  })

  it('allows sending transfer to someone new with valid 8-digit account number', async () => {
    const user = userEvent.setup()
    renderApp()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Good evening, Ava' })).toBeInTheDocument()
    })

    const openTransferBtns = screen.getAllByRole('button', { name: /new transfer/i })
    await user.click(openTransferBtns[0])

    // Toggle "Send to someone new"
    const newRecipientBtn = screen.getByRole('button', { name: /\+ Send to someone new/i })
    await user.click(newRecipientBtn)

    // Try submitting without filling fields -> validation error
    const continueBtn = screen.getByRole('button', { name: 'Continue' })
    await user.click(continueBtn)

    expect(screen.getByText('Name must be at least 2 characters.')).toBeInTheDocument()

    // Fill new recipient fields
    const nameInput = screen.getByPlaceholderText('e.g. Alex Lim')
    const accountInput = screen.getByPlaceholderText('12345678')
    const bankSelect = screen.getByRole('combobox', { name: 'Bank' })

    await user.type(nameInput, 'Alex Lim')
    await user.type(accountInput, '12345678')
    await user.selectOptions(bankSelect, 'OCBC')

    await user.click(continueBtn)

    // Should successfully proceed to Step 2: How much?
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'How much?' })).toBeInTheDocument()
    })
  })

  it('validates account number must be exactly 8 digits', async () => {
    const user = userEvent.setup()
    renderApp()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Good evening, Ava' })).toBeInTheDocument()
    })

    const openTransferBtns = screen.getAllByRole('button', { name: /new transfer/i })
    await user.click(openTransferBtns[0])

    const newRecipientBtn = screen.getByRole('button', { name: /\+ Send to someone new/i })
    await user.click(newRecipientBtn)

    const nameInput = screen.getByPlaceholderText('e.g. Alex Lim')
    const accountInput = screen.getByPlaceholderText('12345678')
    const bankSelect = screen.getByRole('combobox', { name: 'Bank' })

    await user.type(nameInput, 'Alex Lim')
    await user.type(accountInput, '123') // Invalid: only 3 digits
    await user.selectOptions(bankSelect, 'OCBC')

    const continueBtn = screen.getByRole('button', { name: 'Continue' })
    await user.click(continueBtn)

    expect(screen.getByText('Enter a valid 8-digit account number.')).toBeInTheDocument()
  })

  it('supports light/dark theme and retail/premium segment switching', async () => {
    const user = userEvent.setup()
    renderApp()

    const themeToggle = screen.getByRole('button', { name: /mode/i })
    const initialTheme = document.documentElement.getAttribute('data-theme')
    await user.click(themeToggle)
    expect(document.documentElement.getAttribute('data-theme')).not.toBe(initialTheme)

    const premiumRadio = screen.getAllByRole('radio', { name: 'Premium', hidden: true })[0]
    await user.click(premiumRadio)
    expect(document.documentElement.getAttribute('data-segment')).toBe('premium')
  })

  it('supports hiding and revealing balances across the dashboard', async () => {
    const user = userEvent.setup()
    renderApp()

    await waitFor(() => {
      expect(screen.getByText('Total available')).toBeInTheDocument()
    })

    // Initially balances are visible
    expect(screen.getByText(/17,120\.55/)).toBeInTheDocument()
    expect(screen.getByText(/4,280\.55/)).toBeInTheDocument()

    // Click balance toggle button
    const hideBtn = screen.getByRole('button', { name: 'Hide balances' })
    await user.click(hideBtn)

    // Balances are masked
    expect(screen.queryByText(/17,120\.55/)).not.toBeInTheDocument()
    const maskedElements = screen.getAllByText('SGD ****')
    expect(maskedElements.length).toBeGreaterThanOrEqual(2)

    // Click again to reveal
    const showBtn = screen.getByRole('button', { name: 'Show balances' })
    await user.click(showBtn)

    expect(screen.getByText(/17,120\.55/)).toBeInTheDocument()
  })

  it('prompts confirmation when attempting to discard a half-filled transfer', async () => {
    const user = userEvent.setup()
    renderApp()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Good evening, Ava' })).toBeInTheDocument()
    })

    const openTransferBtns = screen.getAllByRole('button', { name: /new transfer/i })
    await user.click(openTransferBtns[0])

    // Pick Jamie Tan and advance to amount step so form is half-filled
    const payeeRadio = await screen.findByRole('radio', { name: /Jamie Tan/i })
    await user.click(payeeRadio)
    await user.click(screen.getByRole('button', { name: 'Continue' }))

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'How much?' })).toBeInTheDocument()
    })

    // Try closing dialog via close button
    const closeBtn = screen.getByRole('button', { name: 'Close transfer dialog' })
    await user.click(closeBtn)

    // Discard confirmation dialog appears
    expect(screen.getByRole('heading', { name: 'Discard this transfer?' })).toBeInTheDocument()

    // Click "Keep editing"
    const keepEditingBtn = screen.getByRole('button', { name: 'Keep editing' })
    await user.click(keepEditingBtn)

    expect(screen.queryByRole('heading', { name: 'Discard this transfer?' })).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'How much?' })).toBeInTheDocument()

    // Try closing again and choose "Discard"
    await user.click(closeBtn)
    const discardBtn = screen.getByRole('button', { name: 'Discard' })
    await user.click(discardBtn)

    // Dialog is now closed
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'New transfer' })).not.toBeInTheDocument()
    })
  })

  it('supports opening transfer dialog via #transfer hash link', async () => {
    window.location.hash = '#transfer'
    renderApp()

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Who are you sending to?' })).toBeInTheDocument()
    })

    // Clean up hash
    window.location.hash = ''
  })
})
