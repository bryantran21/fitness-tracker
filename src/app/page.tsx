import { supabase } from '@/lib/supabase'

export default async function Home() {
  // We're telling Supabase: "Give me everything from the workouts table"
  const { data, error } = await supabase.from('workouts').select('*')

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // This ensures the session is handled by your callback route
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) {
      console.error("Auth error:", error.message)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-12 font-sans">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">
          Iron Log <span className="text-purple-500">Tracker</span>
        </h1>
        
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
          <h2 className="text-xl font-semibold mb-4">Database Connection Status:</h2>
          
          {error ? (
            <div className="text-red-400 p-4 bg-red-400/10 rounded-lg border border-red-400/20">
              ❌ Error: {error.message}
            </div>
          ) : (
            <div className="text-emerald-400 p-4 bg-emerald-400/10 rounded-lg border border-emerald-400/20">
              ✅ Successfully linked to Supabase!
            </div>
          )}

          <div className="mt-6">
            <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-2">Raw Data Output</h3>
            <pre className="bg-black/50 p-4 rounded-xl overflow-auto text-xs border border-white/5">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </main>
  )
}