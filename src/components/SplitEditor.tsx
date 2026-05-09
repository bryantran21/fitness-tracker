// src/components/SplitEditor.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion } from 'framer-motion'
import { ChevronLeft, Save, Sparkles } from 'lucide-react'

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const MUSCLE_GROUPS = ["Chest", "Back", "Shoulders", "Biceps", "Triceps", "Core", "Quads", "Hamstrings", "Glutes", "Full Body"]

export default function SplitEditor({ onSave }: { onSave: () => void }) {
  const [splits, setSplits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchSplits() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('training_splits').select('*').eq('user_id', user.id).order('day_of_week', { ascending: true })
      const fullSplit = DAYS.map((day, index) => {
        const existing = data?.find(s => s.day_of_week === index)
        return existing || { day_of_week: index, day_name: day, muscle_groups: [] }
      })
      setSplits(fullSplit)
      setLoading(false)
    }
    fetchSplits()
  }, [])

  const toggleMuscle = (dayIndex: number, muscle: string) => {
    const newSplits = [...splits]
    const current = newSplits[dayIndex].muscle_groups
    newSplits[dayIndex].muscle_groups = current.includes(muscle) 
      ? current.filter((m: any) => m !== muscle) 
      : [...current, muscle]
    setSplits(newSplits)
  }

  const handleSaveAll = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const updates = splits.map(s => ({
      user_id: user.id,
      day_of_week: s.day_of_week,
      day_name: s.day_name,
      muscle_groups: s.muscle_groups
    }))

    // Upsert logic: if user_id and day_of_week combination exists, update it.
    const { error } = await supabase
      .from('training_splits')
      .upsert(updates, { onConflict: 'user_id,day_of_week' })

    if (error) {
      console.error("Save Error:", error.message)
      alert("Failed to commit split. Check console.")
    } else {
      onSave()
    }
    setSaving(false)
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-32">
      <div className="flex justify-between items-center py-6 mb-4">
        <button onClick={onSave} className="p-3 bg-white/5 border border-white/10 rounded-full text-gray-500"><ChevronLeft size={20} /></button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter">Edit Split</h2>
        <div className="w-10"></div>
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        {splits.map((day, idx) => (
          <div key={idx} className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black italic uppercase tracking-tight">{day.day_name}</h3>
              <span className="text-[10px] font-black uppercase text-purple-500 tracking-widest bg-purple-500/10 px-3 py-1 rounded-full">
                {day.muscle_groups.length > 0 ? `${day.muscle_groups.length} Groups` : 'Rest'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map(muscle => (
                <button
                  key={muscle}
                  onClick={() => toggleMuscle(idx, muscle)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                    day.muscle_groups.includes(muscle) 
                      ? 'bg-purple-500 border-purple-500 text-white shadow-[0_0_15px_rgba(159,85,255,0.3)]' 
                      : 'bg-white/5 border-white/5 text-gray-600'
                  }`}
                >
                  {muscle}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent">
        <button 
          onClick={handleSaveAll}
          disabled={saving}
          className="w-full max-w-md mx-auto py-5 bg-white text-black font-black rounded-3xl text-lg uppercase italic tracking-tighter flex items-center justify-center gap-3 shadow-2xl"
        >
          {saving ? <Sparkles className="animate-spin" /> : "Commit Split"}
        </button>
      </div>
    </div>
  )
}