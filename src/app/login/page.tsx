'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) console.error("Auth error:", error.message)
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    if (error) setMessage(`Error: ${error.message}`)
    else setMessage('Check your email for the magic link! 🪄')
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md p-8 rounded-3xl bg-[#0a0a0a] border border-white/10 backdrop-blur-xl shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2">Fitness Tracker</h1>
        <p className="text-gray-400 mb-8 text-sm">Sign in to start tracking your progress.</p>
        
        {/* --- GOOGLE SSO BUTTON --- */}
        <button 
          onClick={handleGoogleLogin}
          className="w-full mb-6 py-3.5 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-all active:scale-[0.98]"
        >
          <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
          Continue with Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-white/10"></span></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0a0a0a] px-2 text-gray-500">Or continue with email</span></div>
        </div>

        {/* --- MAGIC LINK FORM --- */}
        <form onSubmit={handleMagicLink} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button 
            disabled={loading}
            className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
          {message && <p className="text-center text-sm text-purple-400 mt-4">{message}</p>}
        </form>
      </div>
    </main>
  )
}