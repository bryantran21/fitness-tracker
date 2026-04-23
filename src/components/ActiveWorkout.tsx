'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Expanded list for better filtering
const EXERCISE_DATABASE = [
  { name: 'Bench Press', group: 'Chest' },
  { name: 'Incline Press', group: 'Chest' },
  { name: 'Dumbbell Flyes', group: 'Chest' },
  { name: 'Pullups', group: 'Back' },
  { name: 'Lat Pulldown', group: 'Back' },
  { name: 'Deadlift', group: 'Back' },
  { name: 'Squat', group: 'Legs' },
  { name: 'Leg Press', group: 'Legs' },
  { name: 'Shoulder Press', group: 'Shoulders' },
  { name: 'Lateral Raise', group: 'Shoulders' },
  { name: 'Bicep Curl', group: 'Biceps' },
  { name: 'Tricep Pushdown', group: 'Triceps' },
  { name: 'Plank', group: 'Abs' },
]

export default function ActiveWorkout({ onFinished }: { onFinished: () => void }) {
  const [todaySplit, setTodaySplit] = useState<any>(null)
  const [activeMuscleGroup, setActiveMuscleGroup] = useState<string | null>(null)
  const [workoutQueue, setWorkoutQueue] = useState<any[]>([]) // Your "Downward" log
  const [search, setSearch] = useState('')

  useEffect(() => {
    const getTodayPlan = async () => {
      const today = new Date().getDay()
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase.from('training_splits').select('*').eq('user_id', user?.id).eq('day_of_week', today).maybeSingle()
      
      if (data) {
        setTodaySplit(data)
        // Auto-set the first muscle group as active filter
        if (data.muscle_groups?.length > 0) setActiveMuscleGroup(data.muscle_groups[0])
      }
    }
    getTodayPlan()
  }, [])

  const addToQueue = (exerciseName: string) => {
    setWorkoutQueue([...workoutQueue, { 
        name: exerciseName, 
        equipment: 'Free Weight', 
        sets: [{ reps: '', weight: '' }] 
    }])
    setSearch('')
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-40 max-w-md mx-auto animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none">
          {todaySplit?.day_name || "Free Session"}
        </h2>
        <button onClick={onFinished} className="text-[10px] font-black uppercase text-gray-500 border border-white/10 px-3 py-1 rounded-full">Cancel</button>
      </div>

      {/* VERSION A: MUSCLE GROUP FILTERS */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 custom-scrollbar">
        <button 
          onClick={() => setActiveMuscleGroup(null)}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase border ${!activeMuscleGroup ? 'bg-white text-black' : 'bg-white/5 border-white/10 text-gray-500'}`}
        >
          All
        </button>
        {todaySplit?.muscle_groups?.map((group: string) => (
          <button
            key={group}
            onClick={() => setActiveMuscleGroup(group)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap transition-all border ${
              activeMuscleGroup === group ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/5 text-gray-500'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {/* SEARCH & ADD SECTION */}
      <div className="space-y-3 mb-12">
        <input 
          placeholder="Find exercise..."
          className="w-full p-4 bg-[#0a0a0a] border border-white/5 rounded-2xl text-sm font-bold focus:border-purple-500 transition-all outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        
        {/* Suggestion List (Filtered by active muscle group) */}
        <div className="flex flex-wrap gap-2">
          {EXERCISE_DATABASE
            .filter(ex => (!activeMuscleGroup || ex.group === activeMuscleGroup))
            .filter(ex => ex.name.toLowerCase().includes(search.toLowerCase()))
            .slice(0, 6) // Keep it clean
            .map(ex => (
              <button
                key={ex.name}
                onClick={() => addToQueue(ex.name)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black uppercase hover:bg-purple-500/20 transition-all"
              >
                + {ex.name}
              </button>
            ))
          }
        </div>
      </div>

      {/* THE QUEUE (Lifts build downward) */}
      <div className="space-y-10">
        {workoutQueue.map((item, workoutIdx) => (
          <div key={workoutIdx} className="animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-end mb-4">
               <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">{item.name}</h3>
               <button 
                onClick={() => setWorkoutQueue(workoutQueue.filter((_, i) => i !== workoutIdx))}
                className="text-[8px] font-black text-red-500 uppercase tracking-widest"
               >
                 Remove
               </button>
            </div>

            {/* SETS FOR THIS EXERCISE */}
            <div className="space-y-2">
              {item.sets.map((set: any, setIdx: number) => (
                <div key={setIdx} className="flex gap-2 items-center">
                  <div className="w-8 text-[10px] font-black text-purple-500">#{setIdx + 1}</div>
                  <input 
                    placeholder="LBS"
                    type="number"
                    className="flex-1 bg-white/5 border border-white/5 p-3 rounded-xl text-center font-bold text-sm"
                    value={set.weight}
                    onChange={(e) => {
                        const newQueue = [...workoutQueue];
                        newQueue[workoutIdx].sets[setIdx].weight = e.target.value;
                        setWorkoutQueue(newQueue);
                    }}
                  />
                  <input 
                    placeholder="REPS"
                    type="number"
                    className="flex-1 bg-white/5 border border-white/5 p-3 rounded-xl text-center font-bold text-sm"
                    value={set.reps}
                    onChange={(e) => {
                        const newQueue = [...workoutQueue];
                        newQueue[workoutIdx].sets[setIdx].reps = e.target.value;
                        setWorkoutQueue(newQueue);
                    }}
                  />
                </div>
              ))}
              <button 
                onClick={() => {
                    const newQueue = [...workoutQueue];
                    newQueue[workoutIdx].sets.push({ reps: '', weight: '' });
                    setWorkoutQueue(newQueue);
                }}
                className="w-full py-2 bg-white/5 border border-dashed border-white/10 rounded-xl text-[10px] font-black uppercase text-gray-600"
              >
                + Add Set
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* FINISH ACTION */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent">
        <button 
          onClick={onFinished} // Wire this to a handleSave function similar to before
          disabled={workoutQueue.length === 0}
          className="w-full max-w-md mx-auto py-5 bg-white text-black font-black rounded-3xl text-lg uppercase italic tracking-tighter active:scale-95 transition-all disabled:opacity-20"
        >
          Finish & Log Workout
        </button>
      </div>
    </div>
  )
}