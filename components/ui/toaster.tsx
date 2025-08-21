// components/ui/toaster.tsx
'use client'

import * as React from 'react'
import { createPortal } from 'react-dom'
import {
  Toast as ToastPrimitive,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'
import { useToast } from './use-toast'

export function Toaster() {
  const { toasts } = useToast()

  // Mount on client & bind to a stable DOM node
  const [host, setHost] = React.useState<HTMLElement | null>(null)
  React.useEffect(() => {
    setHost(document.getElementById('toast-root'))
  }, [])

  if (!host) return null

  return createPortal(
    <ToastProvider>
      {toasts.map((t) => (
        <ToastPrimitive key={t.id}>
          <div className="grid gap-1">
            {t.title ? <ToastTitle>{t.title}</ToastTitle> : null}
            {t.description ? <ToastDescription>{t.description}</ToastDescription> : null}
          </div>
          {t.action}
          <ToastClose />
        </ToastPrimitive>
      ))}
      <ToastViewport />
    </ToastProvider>,
    host
  )
}
