import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export default async function Home() {
  const cookieStore = await cookies()
  
  // We check if the user is already logged in
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // If logged in, send them to the dashboard
  if (user) {
    redirect('/dashboard')
  }

  // If NOT logged in, send them to the login/signup page
  redirect('/login')

  // This part never actually renders due to the redirects above, 
  // but we keep a fragment to satisfy the TypeScript return type.
  return <></>
}