// src/components/DashboardGrid.tsx

export default function DashboardGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-full max-w-6xl mx-auto p-4">
      
      {/* CHECK-IN (Large Main Box) */}
      <div className="md:col-span-2 md:row-span-1 bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-purple-500/50 transition-all group">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Check-in</h2>
          <p className="text-gray-400">Scheduled: <span className="text-purple-400 font-mono">Push Day A</span></p>
        </div>
        <button className="mt-8 bg-white text-black py-4 rounded-xl font-bold group-hover:bg-purple-500 group-hover:text-white transition-all">
          Start Workout
        </button>
      </div>

      {/* PLAN WORKOUT (Vertical or Square) */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-blue-500/50 transition-all">
        <h3 className="text-lg font-bold text-white">Plan Workout</h3>
        <p className="text-sm text-gray-500">Set your weekly training split.</p>
        <div className="mt-4 flex gap-1">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <div key={i} className={`h-8 w-full rounded-md border border-white/5 ${i < 5 ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-600'} flex items-center justify-center text-xs font-bold`}>
              {day}
            </div>
          ))}
        </div>
      </div>

      {/* VIEW GRAPHS (Wide or Square) */}
      <div className="md:col-span-1 bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-green-500/50 transition-all">
        <h3 className="text-lg font-bold text-white">View Graphs</h3>
        <div className="h-24 w-full bg-gradient-to-t from-green-500/10 to-transparent border-b border-green-500/20 flex items-end pb-2">
           {/* Replace this with a real Chart component later */}
           <div className="w-full flex justify-between items-end h-full px-2 gap-1">
              {[40, 70, 45, 90, 65, 80].map((h, i) => (
                <div key={i} style={{ height: `${h}%` }} className="w-full bg-green-500/40 rounded-t-sm"></div>
              ))}
           </div>
        </div>
      </div>

      {/* CONSISTENCY SCORE (Small Detail Box) */}
      <div className="md:col-span-2 bg-[#0a0a0a] border border-white/10 rounded-3xl p-6 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold">Goal: 5 Days / Week</h3>
          <p className="text-sm text-gray-500 italic">"Stick to it, Bryan."</p>
        </div>
        <div className="text-4xl font-black text-purple-500">80%</div>
      </div>

    </div>
  )
}