// app/(site)/layout.tsx
// Replace these two imports with your real site header/footer components:
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  )
}
