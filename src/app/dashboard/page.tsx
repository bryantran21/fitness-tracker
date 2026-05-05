'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ActivityCalendar from '../../components/ActivityCalender'
import SplitEditor from '@/components/SplitEditor'
import ActiveWorkout from '@/components/ActiveWorkout'

export default function DashboardPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isWorkingOut, setIsWorkingOut] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0) // The Trigger
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
        .from('training_splits').select('*').eq('user_id', user.id).eq('day_of_week', today).maybeSingle()
      setTodaySplit(split)
      setLoading(false)
    }
    getData()
  }, [refreshKey]) // Re-run when workout finishes

  const handleWorkoutFinished = () => {
    setIsWorkingOut(false)
    setRefreshKey(prev => prev + 1) // Forces child components to re-sync
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-gray-500 font-mono text-[10px] animate-pulse uppercase tracking-[0.3em]">SYNCHRONIZING IRON LOG</p>
    </div>
  )

  if (isWorkingOut) return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <ActiveWorkout onFinished={handleWorkoutFinished} />
    </div>
  )

  return (
    <main className="min-h-screen bg-black text-white p-4 pb-24 max-w-md mx-auto overflow-x-hidden relative font-sans">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[30rem] h-[30rem] bg-purple-600/5 blur-[120px] rounded-full"></div>
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-indigo-600/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="relative flex justify-between items-center py-6 px-3 z-10 mb-2">
        <h1 className="text-2xl font-black italic tracking-tighter leading-none">
          IRON <span className="text-purple-500 text-3xl">LOG</span>
        </h1>
        <div className="bg-[#111] p-3 rounded-full border border-white/5 shadow-2xl">
          <span className="text-[10px] font-mono font-black text-gray-500">
            {userEmail?.substring(0, 2).toUpperCase()}
          </span>
        </div>
      </div>

      {isEditing ? (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <SplitEditor onSave={() => setIsEditing(false)} />
        </div>
      ) : (
        <div className="relative flex flex-col gap-4 animate-in fade-in duration-700 z-10">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-1/2 -right-16 w-32 h-32 bg-purple-600/15 blur-[60px] rounded-full pointer-events-none"></div>
            <p className="text-purple-400 text-[10px] font-mono font-black mb-1.5 uppercase tracking-[0.2em]">
              {todaySplit ? "Daily Session" : "Active Rest"}
            </p>
            <h2 className="text-4xl font-black mb-1.5 uppercase italic tracking-tighter leading-none">
              {todaySplit?.day_name || "Recovery"}
            </h2>
            <p className="text-gray-500 text-xs font-mono mb-10 uppercase tracking-[0.1em]">
              {todaySplit?.muscle_groups?.join(' · ') || "Mobility & Integration"}
            </p>
            <button 
              onClick={() => setIsWorkingOut(true)}
              className="w-full py-5 bg-transparent border-2 border-white text-white text-lg font-black uppercase italic tracking-tighter rounded-3xl active:scale-[0.97] transition-all hover:bg-white hover:text-black"
            >
              LOG SESSION
            </button>
          </div>

          <div className="relative rounded-[2.5rem]">
            <ActivityCalendar key={refreshKey} /> 
          </div>

          <div 
            onClick={() => setIsEditing(true)}
            className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 flex justify-between items-center cursor-pointer active:scale-[0.98] transition-all"
          >
            <div>
              <h3 className="font-black text-xl italic uppercase tracking-tighter">TRAINING Split</h3>
              <p className="text-[10px] text-gray-600 uppercase font-black tracking-[0.15em] font-mono mt-0.5">Customize commitment</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}