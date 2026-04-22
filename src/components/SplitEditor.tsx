'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Abs', 'Biceps', 'Triceps']
const DAYS = ['S', 'M', 'T', 'W', 'Th', 'F', 'S']

export default function SplitEditor({ onSave }: { onSave: () => void }) { 
  const [activeDays, setActiveDays] = useState<number[]>([])
  const [daySplits, setDaySplits] = useState<Record<number, string[]>>({})
  const [customNames, setCustomNames] = useState<Record<number, string>>({}) // New state for names
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSplit = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from('training_splits').select('*').eq('user_id', user.id)

      if (data && data.length > 0) {
        const days: number[] = []
        const splits: Record<number, string[]> = {}
        const names: Record<number, string> = {}
        
        data.forEach(item => {
          days.push(item.day_of_week)
          splits[item.day_of_week] = item.muscle_groups
          names[item.day_of_week] = item.day_name || `${DAYS[item.day_of_week]} Day`
        })
        
        setActiveDays(days)
        setDaySplits(splits)
        setCustomNames(names)
      }
      setLoading(false)
    }
    fetchSplit()
  }, [])

  const toggleDay = (index: number) => {
    setActiveDays(prev => {
      if (prev.includes(index)) {
        return prev.filter(d => d !== index)
      } else {
        // Set default name when activating a new day
        setCustomNames(curr => ({ ...curr, [index]: `${DAYS[index]} Day` }))
        return [...prev, index]
      }
    })
  }

  const toggleMuscle = (dayIndex: number, muscle: string) => {
    const current = daySplits[dayIndex] || []
    const next = current.includes(muscle) ? current.filter(m => m !== muscle) : [...current, muscle]
    setDaySplits({ ...daySplits, [dayIndex]: next })
  }

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('training_splits').delete().eq('user_id', user.id)

    const insertData = activeDays.map(day => ({
      user_id: user.id,
      day_of_week: day,
      muscle_groups: daySplits[day] || [],
      day_name: customNames[day] // Save the custom name
    }))

    const { error } = await supabase.from('training_splits').insert(insertData)
    if (!error) onSave()
  }

  if (loading) return <div className="text-center p-10 text-gray-500 font-mono">LOADING SPLIT...</div>

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* IMPROVED BACK BUTTON */}
      <button 
        onClick={onSave}
        className="self-start px-5 py-2 rounded-full border border-white/10 bg-white/5 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-white hover:border-white/20 transition-all flex items-center gap-2"
      >
        <span className="text-lg">←</span> Back to Dashboard
      </button>

      <div className="bg-[#111] text-white p-6 rounded-[2.5rem] border border-white/10 w-full max-w-md mx-auto shadow-2xl">
        <h2 className="text-xl font-black mb-2 uppercase tracking-tighter italic">Edit Training Split</h2>
        <p className="text-gray-500 text-xs mb-8 font-medium uppercase tracking-widest">Commitment Logic</p>

        {/* DAY SELECTOR */}
        <div className="flex justify-between gap-1 mb-10">
          {DAYS.map((day, i) => (
            <button
              key={i}
              onClick={() => toggleDay(i)}
              className={`w-10 h-10 rounded-full font-black text-xs transition-all duration-300 ${
                activeDays.includes(i) 
                ? 'bg-purple-600 text-white ring-4 ring-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                : 'bg-white/5 text-gray-600 border border-white/5 hover:bg-white/10'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* MUSCLE GROUP ASSIGNMENT */}
        <div className="space-y-4 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
          {activeDays.sort((a, b) => a - b).map((dayIndex) => (
            <div key={dayIndex} className="bg-white/5 p-5 rounded-3xl border border-white/5">
              <div className="flex justify-between items-center mb-4">
                {/* EDITABLE DAY NAME */}
                <input 
                  value={customNames[dayIndex] || ""}
                  onChange={(e) => setCustomNames({ ...customNames, [dayIndex]: e.target.value })}
                  placeholder={`${DAYS[dayIndex]} Day`}
                  className="bg-transparent border-none p-0 font-black text-white text-sm uppercase tracking-widest italic focus:ring-0 focus:text-purple-400 transition-colors w-1/2"
                />
                <span className="text-[10px] text-purple-500 font-bold uppercase tracking-widest">Focus</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {MUSCLE_GROUPS.map(muscle => {
                  const isActive = daySplits[dayIndex]?.includes(muscle)
                  return (
                    <button
                      key={muscle}
                      onClick={() => toggleMuscle(dayIndex, muscle)}
                      className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border ${
                        isActive 
                        ? 'bg-purple-500 border-purple-400 text-white shadow-lg shadow-purple-500/20' 
                        : 'bg-black/40 border-white/10 text-gray-500 hover:border-white/20'
                      }`}
                    >
                      {muscle}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
          {activeDays.length === 0 && (
            <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
              <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Select training days above</p>
            </div>
          )}
        </div>

        <button 
          onClick={handleSave}
          className="w-full mt-10 py-5 bg-white text-black font-black rounded-2xl active:scale-95 transition-all shadow-xl hover:bg-purple-500 hover:text-white"
        >
          SAVE TRAINING SPLIT
        </button>
      </div>
    </div>
  )
}