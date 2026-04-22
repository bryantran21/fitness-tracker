'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const BASE_EXERCISES = ['Bench Press', 'Squat', 'Deadlift', 'Bicep Curl', 'Lat Pulldown', 'Shoulder Press', 'Leg Press', 'Incline Press', 'Tricep Pushdown', 'Leg Extensions']

export default function ActiveWorkout({ onFinished }: { onFinished: () => void }) {
  const [todaySplit, setTodaySplit] = useState<any>(null)
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [equipment, setEquipment] = useState<'Cable' | 'Free Weight' | 'Machine'>('Free Weight')
  const [sets, setSets] = useState([{ reps: '', weight: '' }])
  const [lastSession, setLastSession] = useState<any>(null)
  const [search, setSearch] = useState('')

  // 1. Fetch Today's Split
  useEffect(() => {
    const getTodayPlan = async () => {
      const today = new Date().getDay()
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('training_splits')
        .select('*')
        .eq('user_id', user?.id)
        .eq('day_of_week', today)
        // Use .maybeSingle() instead of .single() to avoid errors if today is a rest day
        .maybeSingle()
      
      if (data) setTodaySplit(data)
    }
    getTodayPlan()
  }, [])

  // 2. Fetch History when exercise/equipment changes
  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedExercise) return
      const { data: { user } } = await supabase.auth.getUser()

      const { data } = await supabase
        .from('workout_logs')
        .select('*')
        .eq('user_id', user?.id)
        .eq('exercise_name', selectedExercise)
        .eq('equipment_type', equipment)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      setLastSession(data || null)
    }
    fetchHistory()
  }, [selectedExercise, equipment])

  const handleComplete = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Insert the log
    const { error: logError } = await supabase.from('workout_logs').insert({
      user_id: user.id,
      exercise_name: selectedExercise,
      equipment_type: equipment,
      sets: sets
    })

    // Check-in for the calendar
    await supabase.from('check_ins').insert({
      user_id: user.id,
      date: new Date().toISOString().split('T')[0]
    })

    if (logError) console.error(logError)
    onFinished()
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-32 max-w-md mx-auto animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">
            {todaySplit?.day_name || "Extra Session"}
          </h2>
          <p className="text-purple-500 font-bold text-[10px] uppercase tracking-[0.2em]">
            {todaySplit?.muscle_groups?.join(' + ') || 'Manual Log'}
          </p>
        </div>
        <button 
          onClick={onFinished}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase"
        >
          Cancel
        </button>
      </div>

      {!selectedExercise ? (
        /* SEARCH VIEW */
        <div className="space-y-4">
          <input 
            placeholder="Search Exercise..."
            className="w-full p-5 bg-[#111] border border-white/10 rounded-2xl focus:border-purple-500 outline-none transition-all font-bold"
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {BASE_EXERCISES.filter(ex => ex.toLowerCase().includes(search.toLowerCase())).map(ex => (
              <button 
                key={ex} 
                onClick={() => setSelectedExercise(ex)}
                className="w-full p-5 bg-white/5 rounded-2xl border border-white/5 text-left font-black uppercase italic text-sm hover:bg-purple-500/10 transition-all"
              >
                {ex}
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* LOGGING VIEW */
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div>
            <button onClick={() => setSelectedExercise(null)} className="text-purple-500 text-[10px] font-black mb-1 uppercase tracking-widest">← Change Exercise</button>
            <h3 className="text-4xl font-black uppercase italic leading-none tracking-tighter">{selectedExercise}</h3>
          </div>

          {/* HISTORY BUBBLE */}
          {lastSession && (
            <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-2xl">
              <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest mb-2">Previous ({equipment})</p>
              <div className="flex flex-wrap gap-3">
                {lastSession.sets.map((set: any, idx: number) => (
                  <div key={idx} className="text-xs font-bold text-gray-300">
                    <span className="text-purple-500/50">S{idx+1}:</span> {set.weight}lb × {set.reps}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EQUIPMENT SELECTOR */}
          <div className="flex gap-2">
            {['Cable', 'Free Weight', 'Machine'].map((type) => (
              <button
                key={type}
                onClick={() => setEquipment(type as any)}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black border transition-all ${
                  equipment === type ? 'bg-white text-black border-white' : 'bg-transparent border-white/10 text-gray-500'
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>

          {/* SETS ENTRY */}
          <div className="space-y-3">
            {sets.map((set, i) => (
              <div key={i} className="flex gap-3 items-center bg-[#0a0a0a] p-4 rounded-2xl border border-white/5">
                <span className="font-black text-purple-500 w-6">#{i + 1}</span>
                <input 
                  placeholder="LBS" 
                  type="number"
                  inputMode="numeric"
                  className="w-full bg-white/5 p-3 rounded-xl border border-white/5 text-center font-black text-white"
                  value={set.weight}
                  onChange={(e) => {
                    const newSets = [...sets]; newSets[i].weight = e.target.value; setSets(newSets);
                  }}
                />
                <input 
                  placeholder="REPS" 
                  type="number"
                  inputMode="numeric"
                  className="w-full bg-white/5 p-3 rounded-xl border border-white/5 text-center font-black text-white"
                  value={set.reps}
                  onChange={(e) => {
                    const newSets = [...sets]; newSets[i].reps = e.target.value; setSets(newSets);
                  }}
                />
              </div>
            ))}
            <button 
              onClick={() => setSets([...sets, { reps: '', weight: '' }])}
              className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-gray-600 text-[10px] font-black uppercase tracking-widest hover:border-purple-500/50 hover:text-purple-500 transition-all"
            >
              + Add Set
            </button>
          </div>
        </div>
      )}

      {/* FINISH BUTTON */}
      <div className="fixed bottom-8 left-4 right-4 max-w-md mx-auto">
        <button 
          onClick={handleComplete}
          disabled={!selectedExercise}
          className="w-full py-5 bg-white text-black font-black rounded-2xl shadow-2xl active:scale-95 transition-all disabled:opacity-20"
        >
          FINISH & CHECK-IN
        </button>
      </div>
    </div>
  )
}