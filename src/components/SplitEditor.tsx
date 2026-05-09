// src/components/SplitEditor.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Save, Sparkles, X } from 'lucide-react'

const DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
]

const MUSCLE_GROUPS = [
  "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Quads", "Hamstrings", "Glutes", "Full Body"
]

export default function SplitEditor({ onSave }: { onSave: () => void }) {
  const [splits, setSplits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchSplits() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('training_splits')
        .select('*')
        .eq('user_id', user.id)
        .order('day_of_week', { ascending: true })

      // Fill in empty days if they don't exist in DB
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
    if (current.includes(muscle)) {
      newSplits[dayIndex].muscle_groups = current.filter((m: string) => m !== muscle)
    } else {
      newSplits[dayIndex].muscle_groups = [...current, muscle]
    }
    setSplits(newSplits)
  }

  const handleSaveAll = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const updates = splits.map(s => ({
      ...s,
      user_id: user.id,
      // Ensure we don't send the ID if it's a new temporary object
      id: s.id || undefined 
    }))

    const { error } = await supabase
      .from('training_splits')
      .upsert(updates, { onConflict: 'user_id, day_of_week' })

    if (!error) onSave()
    setSaving(false)
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-32">
      {/* Header */}
      <div className="flex justify-between items-center py-6 mb-4">
        <button onClick={onSave} className="p-3 bg-white/5 border border-white/10 rounded-full text-gray-500 hover:text-white transition-all">
          <ChevronLeft size={20} />
        </button>
        <h2 className="text-xl font-black italic uppercase tracking-tighter">Edit Split</h2>
        <div className="w-10"></div> {/* Spacer */}
      </div>

      <div className="space-y-4 max-w-2xl mx-auto">
        {splits.map((day, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black italic uppercase tracking-tight text-white">{day.day_name}</h3>
              <span className="text-[10px] font-black uppercase text-purple-500 tracking-widest bg-purple-500/10 px-3 py-1 rounded-full">
                {day.muscle_groups.length > 0 ? `${day.muscle_groups.length} Groups` : 'Rest Day'}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map(muscle => {
                const isActive = day.muscle_groups.includes(muscle)
                return (
                  <button
                    key={muscle}
                    onClick={() => toggleMuscle(idx, muscle)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                      isActive 
                        ? 'bg-purple-500 border-purple-500 text-white shadow-[0_0_15px_rgba(159,85,255,0.3)]' 
                        : 'bg-white/5 border-white/5 text-gray-600 hover:border-white/20'
                    }`}
                  >
                    {muscle}
                  </button>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floating Save Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent">
        <button 
          onClick={handleSaveAll}
          disabled={saving}
          className="w-full max-w-md mx-auto py-5 bg-white text-black font-black rounded-3xl text-lg uppercase italic tracking-tighter flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"
        >
          {saving ? <Sparkles className="animate-spin" /> : <Save size={20} />}
          {saving ? "Syncing..." : "Commit Split"}
        </button>
      </div>
    </div>
  )
}