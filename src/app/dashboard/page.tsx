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
  const [todaySplit, setTodaySplit] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/login'; return; }
      setUserEmail(user.email || '')
      
      const today = new Date().getDay()
      const { data: split } = await supabase
        .from('training_splits')
        .select('*')
        .eq('user_id', user.id)
        .eq('day_of_week', today)
        .maybeSingle()
        
      setTodaySplit(split)
      setLoading(false)
    }
    getData()
  }, [refreshKey])

  const handleWorkoutFinished = () => {
    setIsWorkingOut(false)
    setRefreshKey(prev => prev + 1) 
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.4em]"
      >
        SYNCHRONIZING IRON LOG
      </motion.p>
    </div>
  )

  return (
    <main className="min-h-screen bg-black text-white p-4 pb-24 max-w-5xl mx-auto overflow-x-hidden relative font-sans">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-purple-600/[0.03] blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-indigo-600/[0.03] blur-[100px] rounded-full"></div>
      </div>

      <AnimatePresence mode="wait">
        {isWorkingOut ? (
          <motion.div key="workout" className="relative z-50">
            <ActiveWorkout onFinished={handleWorkoutFinished} />
          </motion.div>
        ) : isEditing ? (
          <motion.div key="editing" className="relative z-50">
            <SplitEditor onSave={() => setIsEditing(false)} />
          </motion.div>
        ) : (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 flex flex-col gap-8"
          >
            {/* TOP BAR */}
            <div className="flex justify-between items-center py-6 px-2">
              <h1 className="text-2xl font-black italic tracking-tighter leading-none select-none">
                IRON <span className="text-purple-500 text-3xl">LOG</span>
              </h1>
              <div className="bg-[#0a0a0a] p-3 rounded-full border border-white/5 shadow-2xl">
                <span className="text-[10px] font-mono font-black text-purple-500">
                  {userEmail?.substring(0, 2).toUpperCase()}
                </span>
              </div>
            </div>

            {/* 1. PRIMARY ACTIONS (GRID) */}
            <DashboardGrid 
              onStartWorkout={() => setIsWorkingOut(true)} 
              todaySplit={todaySplit} 
            />

            {/* 2. SECONDARY HISTORY (HEATMAP) */}
            <section className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-2 md:p-6">
               <ActivityCalendar key={refreshKey} />
            </section>

            {/* 3. SETTINGS */}
            <button 
              onClick={() => setIsEditing(true)}
              className="group mx-auto flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/5 rounded-full hover:border-purple-500/30 transition-all active:scale-95"
            >
              <div className="w-2 h-2 rounded-full bg-purple-500 group-hover:animate-ping"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 group-hover:text-white transition-colors">
                Reconfigure Training Split
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}