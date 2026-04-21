'use client'

import { useState } from 'react'

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms']
const DAYS = ['S', 'M', 'T', 'W', 'Th', 'F', 'S']

export default function SplitEditor({ onSave }: { onSave: () => void }) { 
  const [activeDays, setActiveDays] = useState<number[]>([1, 2, 3, 5, 6])
  
  // Store muscle groups per day: { 1: ['Chest', 'Arms'], 2: ['Back'] ... }
  const [daySplits, setDaySplits] = useState<Record<number, string[]>>({
    1: ['Chest', 'Arms'],
    2: ['Back'],
  })

  const toggleDay = (index: number) => {
    setActiveDays(prev => 
      prev.includes(index) ? prev.filter(d => d !== index) : [...prev, index]
    )
  }

  const toggleMuscle = (dayIndex: number, muscle: string) => {
    const current = daySplits[dayIndex] || []
    const next = current.includes(muscle)
      ? current.filter(m => m !== muscle)
      : [...current, muscle]
    
    setDaySplits({ ...daySplits, [dayIndex]: next })
  }

  const handleSave = async () => {
    // We will add the Supabase save logic here next!
    console.log("Split saved locally")
    onSave() // This closes the editor
  }

  return (
    <div className="bg-[#111] text-white p-6 rounded-[2.5rem] border border-white/10 w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-2">Edit Training Split</h2>
      <p className="text-gray-500 text-sm mb-6">Which days do you commit to training?</p>

      {/* 1. DAY SELECTOR */}
      <div className="flex justify-between gap-2 mb-8">
        {DAYS.map((day, i) => (
          <button
            key={i}
            onClick={() => toggleDay(i)}
            className={`w-10 h-10 rounded-full font-bold transition-all ${
              activeDays.includes(i) 
              ? 'bg-purple-600 text-white ring-2 ring-purple-400 ring-offset-2 ring-offset-black' 
              : 'bg-white/5 text-gray-500 border border-white/5'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* 2. MUSCLE GROUP ASSIGNMENT */}
      <div className="space-y-6">
        {activeDays.sort().map((dayIndex) => (
          <div key={dayIndex} className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <div className="flex justify-between items-center mb-3">
              <span className="font-bold text-purple-400">{DAYS[dayIndex]} Day</span>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Select Focus</span>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map(muscle => {
                const isActive = daySplits[dayIndex]?.includes(muscle)
                return (
                  <button
                    key={muscle}
                    onClick={() => toggleMuscle(dayIndex, muscle)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                      isActive 
                      ? 'bg-white text-black border-white' 
                      : 'bg-transparent border-white/10 text-gray-400'
                    }`}
                  >
                    {muscle}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={handleSave}
        className="w-full mt-8 py-4 bg-white text-black font-black rounded-2xl active:scale-95 transition-all"
      >
        SAVE SPLIT
      </button>
    </div>
  )
}