// src/components/ActivityCalendar.tsx
'use client'

export default function ActivityCalendar() {
  const daysInMonth = 30; // You can make this dynamic later
  const goalDays = [1, 2, 3, 5, 6, 8, 9, 13]; // Example data
  const completedDays = [6, 9, 13];

  return (
    <div className="bg-[#111] border border-white/5 rounded-3xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-white">April 2026</h3>
        <div className="flex gap-2">
          <span className="text-gray-500 text-xs uppercase tracking-widest">Day 21</span>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-6 text-center">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
          <span key={d} className="text-[10px] text-gray-500 font-bold">{d}</span>
        ))}
        
        {/* Empty slots for start of month alignment if needed */}
        <div className="col-span-3"></div> 

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isCompleted = completedDays.includes(day);
          const isMissed = goalDays.includes(day) && !isCompleted && day < 21;
          const isToday = day === 21;

          return (
            <div key={i} className="relative aspect-square flex items-center justify-center">
              <div className={`
                w-full h-full rounded-full flex items-center justify-center text-xs transition-all
                ${isCompleted ? 'bg-green-500/20 text-green-400 border border-green-500/50' : ''}
                ${isMissed ? 'text-red-500' : 'text-gray-400'}
                ${isToday ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black' : ''}
              `}>
                {day}
                {isMissed && <span className="absolute -bottom-1 text-[8px] text-red-500">×</span>}
                {isCompleted && <span className="absolute -bottom-1 text-[8px] text-green-500">✓</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <p className="text-[10px] text-gray-500 uppercase">Current Streak</p>
          <p className="text-2xl font-bold text-orange-500">0 <span className="text-sm">days</span></p>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <p className="text-[10px] text-gray-500 uppercase">Best Streak</p>
          <p className="text-2xl font-bold text-yellow-500">13 <span className="text-sm">days</span></p>
        </div>
      </div>
    </div>
  )
}