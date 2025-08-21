'use client'

import * as React from 'react'

export type ToastActionElement = React.ReactNode

// If your <Toast /> component in components/ui/toast.tsx exposes more props,
// you can add them here as optional fields. Keep it minimal to start.
export type ToastProps = {
  variant?: 'default' | 'destructive'
  className?: string
}

export type Toast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
} & ToastProps

type ToastState = { toasts: Toast[] }

const listeners = new Set<React.Dispatch<React.SetStateAction<ToastState>>>()
let memoryState: ToastState = { toasts: [] }

function updateToasts(updater: (prev: Toast[]) => Toast[]) {
  memoryState = { toasts: updater(memoryState.toasts) }
  listeners.forEach((l) => l(memoryState))
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState)

  React.useEffect(() => {
    listeners.add(setState)
    return () => {
      listeners.delete(setState)
    }
  }, [])

  const toast = React.useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    updateToasts((prev) => [...prev, { id, ...t }])
    return { id }
  }, [])

  const dismiss = React.useCallback((id?: string) => {
    if (!id) {
      updateToasts(() => [])
    } else {
      updateToasts((prev) => prev.filter((x) => x.id !== id))
    }
  }, [])

  return { ...state, toast, dismiss }
}

// Fire-and-forget imperative API if you prefer calling toast({...}) outside components
export function toast(t: Omit<Toast, 'id'>) {
  const id = Math.random().toString(36).slice(2)
  updateToasts((prev) => [...prev, { id, ...t }])
  return { id }
}
