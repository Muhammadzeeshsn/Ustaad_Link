// app/auth/page.tsx
import AuthClient from '@/components/auth/page'

export default function AuthPage() {
  // Render your existing client-side auth UI.
  // No redirects here — avoid loops and unstable mounts.
  return <AuthClient />
}
