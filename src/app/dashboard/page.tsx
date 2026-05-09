// src/app/dashboard/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ActivityCalendar from '../../components/ActivityCalender'
import SplitEditor from '@/components/SplitEditor'
import ActiveWorkout from '@/components/ActiveWorkout'
import DashboardGrid from '@/components/DashboardGrid'
import { motion, AnimatePresence } from 'framer-motion'

export default function DashboardPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isWorkingOut, setIsWorkingOut] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [userEmail, setUserEmail] = useState('')
  const [allSplits, setAllSplits] = useState<any[]>([])
  const [todaySplit, setTodaySplit] = useState<any>(null)
  const [consistency, setConsistency] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return; }
      setUserEmail(user.email || '')
      
      // 1. Fetch Full Split for Grid
      const { data: splits } = await supabase
        .from('training_splits')
        .select('*')
        .eq('user_id', user.id)
      setAllSplits(splits || [])

      // 2. Set Today's Specific Split
      const today = new Date().getDay()
      setTodaySplit(splits?.find(s => s.day_of_week === today) || null)

      // 3. Calculate Consistency (Workouts in last 30 days vs Goal)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const { count } = await supabase
        .from('check_ins')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      
      // Calculate score (assuming 5 day/week goal = 20 workouts a month)
      const score = Math.min(Math.round(((count || 0) / 20) * 100), 100)
      setConsistency(score)
      
      setLoading(false)
    }
    fetchData()
  }, [refreshKey])

  const handleWorkoutFinished = () => {
    setIsWorkingOut(false)
    setRefreshKey(prev => prev + 1) 
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-gray-500 font-mono text-[10px] animate-pulse uppercase tracking-[0.4em]">
      SYNCHRONIZING IRON LOG
    </div>
  )

  return (
    <main className="min-h-screen bg-black text-white p-4 pb-24 max-w-5xl mx-auto relative">
      <AnimatePresence mode="wait">
        {isWorkingOut ? (
          <ActiveWorkout key="workout" onFinished={handleWorkoutFinished} />
        ) : isEditing ? (
          <SplitEditor key="editing" onSave={() => setIsEditing(false)} />
        ) : (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
            <div className="flex justify-between items-center py-6 px-2">
              <h1 className="text-2xl font-black italic tracking-tighter leading-none">IRON <span className="text-purple-500 text-3xl">LOG</span></h1>
              <div className="bg-[#0a0a0a] p-3 rounded-full border border-white/5"><span className="text-[10px] font-mono font-black text-purple-500">{userEmail?.substring(0, 2).toUpperCase()}</span></div>
            </div>

            <DashboardGrid 
              onStartWorkout={() => setIsWorkingOut(true)} 
              todaySplit={todaySplit}
              userSplits={allSplits}
              consistencyScore={consistency}
            />

            <section className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-2 md:p-6">
               <ActivityCalendar key={refreshKey} />
            </section>

            <button onClick={() => setIsEditing(true)} className="group mx-auto flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/5 rounded-full hover:border-purple-500/30 transition-all">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-white">Reconfigure Training Split</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}