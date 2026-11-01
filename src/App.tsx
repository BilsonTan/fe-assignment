import React, { useState } from 'react'
import { ThemeProvider } from './context'
import { Header } from './components/header'
import { Dashboard } from './components/dashboard'
import { TransferDialog } from './components/transfer'

export default function App(): React.JSX.Element {
  const [isTransferOpen, setIsTransferOpen] = useState(false)

  const handleOpenTransfer = () => {
    setIsTransferOpen(true)
  }

  const handleCloseTransfer = () => {
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
      </div>
    </ThemeProvider>
  )
}
