import { createClient } from '@/lib/supabaseServer'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  // 1. We look for the 'code' provided by Google/Supabase
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    
    // 2. We exchange that temporary code for a permanent session (cookie)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 3. SUCCESS! Clear the URL and go to dashboard
      return NextResponse.redirect(`${origin}/dashboard`)
    }
    
    // If exchange fails, we'll see why in your VS Code terminal
    console.error('EXCHANGE ERROR:', error.message)
  }

  // 4. If we got here, something went wrong
  return NextResponse.redirect(`${origin}/login?error=auth-failure`)
}