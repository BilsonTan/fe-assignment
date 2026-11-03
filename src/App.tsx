import React, { useEffect, useState } from 'react'
import { ThemeProvider } from './context'
import { Header } from './components/header'
import { Dashboard } from './components/dashboard'
import { TransferDialog } from './components/transfer'
import { DebugMenu } from './dev/debug-menu'
import { isDebugEnabled } from './mocks/scenario'

export default function App(): React.JSX.Element {
  const [isTransferOpen, setIsTransferOpen] = useState(() => {
    return typeof window !== 'undefined' && window.location.hash === '#transfer'
  })

  // Listen for hash changes to support #transfer deep link
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#transfer') {
        setIsTransferOpen(true)
      } else {
        setIsTransferOpen(false)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const handleOpenTransfer = () => {
    if (window.location.hash !== '#transfer') {
      window.history.pushState(null, '', '#transfer')
    }
    setIsTransferOpen(true)
  }

  const handleCloseTransfer = () => {
    if (window.location.hash === '#transfer') {
      window.history.replaceState(
        null,
        '',
        window.location.pathname + window.location.search,
      )
    }
    setIsTransferOpen(false)
  }

  return (
    <ThemeProvider>
      <div className="app-shell">
        <Header />
        <Dashboard onOpenTransfer={handleOpenTransfer} />
        <TransferDialog
          isOpen={isTransferOpen}
          onClose={handleCloseTransfer}
        />
        {isDebugEnabled() && <DebugMenu />}
      </div>
    </ThemeProvider>
  )
}
