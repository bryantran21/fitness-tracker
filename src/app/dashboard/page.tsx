import { createClient } from '@/lib/supabaseServer'; // Use the server-side client we made
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Check if the user is actually logged in
  const { data: { user }, error } = await supabase.auth.getUser();

  // If no user is found, kick them back to login
  if (error || !user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold">Iron Dashboard</h1>
            <p className="text-gray-400">Welcome back, {user.email}</p>
          </div>
          <form action="/auth/signout" method="post">
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-sm">
              Sign Out
            </button>
          </form>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-2">Workouts</h3>
            <p className="text-3xl font-mono">0</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-2">Volume (lbs)</h3>
            <p className="text-3xl font-mono text-purple-500">0</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
            <h3 className="text-gray-500 text-sm uppercase tracking-wider mb-2">Days Active</h3>
            <p className="text-3xl font-mono">0</p>
          </div>
        </div>

        <div className="mt-12 p-12 border-2 border-dashed border-white/5 rounded-3xl text-center">
          <p className="text-gray-500 italic">No workouts logged yet. Ready to hit the iron?</p>
          <button className="mt-6 px-8 py-3 bg-purple-600 rounded-full font-bold hover:bg-purple-500 transition-all">
            + Start New Session
          </button>
        </div>
      </div>
    </main>
  );
}