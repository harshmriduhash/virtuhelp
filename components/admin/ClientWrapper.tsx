'use client'

import { useState } from 'react'

interface ClientWrapperProps {
  children: React.ReactNode
  onAction?: (data: any) => Promise<void>
}

export default function ClientWrapper({ children, onAction }: ClientWrapperProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (data: any) => {
    if (!onAction) return
    setIsLoading(true)
    try {
      await onAction(data)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
      {children}
    </div>
  )
}
