// Temporary shim while we migrate off Supabase.
// Any runtime call will throw with a clear message.
export const supabase = new Proxy({}, {
  get() {
    throw new Error(
      'Supabase client is disabled in this project. Replace this component with /api routes.'
    )
  },
}) as any
