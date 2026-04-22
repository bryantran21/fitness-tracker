'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import ActivityCalendar from '../../components/ActivityCalender'
import SplitEditor from '@/components/SplitEditor'
import ActiveWorkout from '@/components/ActiveWorkout'

export default function DashboardPage() {
  const [isEditing, setIsEditing] = useState(false)
  const [isWorkingOut, setIsWorkingOut] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [todaySplit, setTodaySplit] = useState<any>(null)

  // 1. Auth & Data Fetching
  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserEmail(user.email || '')
        
        // Fetch today's planned split
        const today = new Date().getDay()
        const { data: split } = await supabase
          .from('training_splits')
          .select('*')
          .eq('user_id', user.id)
          .eq('day_of_week', today)
          .single()
        
        setTodaySplit(split)
      }
    }
    getData()
  }, [])

  // View 1: The Active Workout (Session Mode)
  if (isWorkingOut) {
    return <ActiveWorkout onFinished={() => setIsWorkingOut(false)} />
  }

  return (
    <main className="min-h-screen bg-black text-white p-4 pb-24 max-w-md mx-auto overflow-x-hidden">
      {/* TOP NAV */}
      <div className="flex justify-between items-center py-6">
        <h1 className="text-2xl font-black italic tracking-tighter">
          IRON <span className="text-purple-500 text-3xl">LOG</span>
        </h1>
        <div className="bg-white/10 p-2 rounded-full w-10 h-10 flex items-center justify-center border border-white/10">
          <span className="text-xs font-bold">{userEmail?.substring(0, 2).toUpperCase() || 'BT'}</span>
        </div>
      </div>

      {isEditing ? (
        /* View 2: The Split Editor */
        <div className="animate-in slide-in-from-bottom-4 duration-300">
          <SplitEditor onSave={() => setIsEditing(false)} />
        </div>
      ) : (
        /* View 3: The Main Bento Dashboard */
        <div className="flex flex-col gap-4 animate-in fade-in duration-500">
          
          {/* TODAY'S ACTION CARD */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl">
            <p className="text-purple-400 text-xs font-black mb-1 uppercase tracking-widest">
              {todaySplit ? "Today's Schedule" : "Rest Day"}
            </p>
            <h2 className="text-3xl font-black mb-1 uppercase italic">
              {todaySplit?.day_name || "Recovery"}
            </h2>
            <p className="text-gray-500 text-xs font-bold mb-6 uppercase tracking-tighter">
              {todaySplit?.muscle_groups?.join(' • ') || "Active Rest & Mobility"}
            </p>
            
            <button 
              onClick={() => setIsWorkingOut(true)}
              className="w-full py-5 bg-white text-black text-lg font-black rounded-2xl active:scale-95 transition-transform shadow-[0_10px_30px_rgba(255,255,255,0.1)]"
            >
              {todaySplit ? "CHECK IN" : "LOG EXTRA SESSION"}
            </button>
          </div>

          {/* PROGRESS CALENDAR */}
          <ActivityCalendar />

          {/* EDIT SPLIT BUTTON */}
          <div 
            onClick={() => setIsEditing(true)}
            className="bg-[#111] border border-white/5 rounded-3xl p-6 flex justify-between items-center cursor-pointer active:bg-white/5 transition-colors"
          >
            <div>
              <h3 className="font-bold text-lg italic uppercase">Training Split</h3>
              <p className="text-xs text-gray-500">Customize your weekly commitment</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>

          {/* LOGOUT BUTTON (Optional) */}
          <button 
            onClick={async () => {
                await supabase.auth.signOut();
                window.location.href = '/login';
            }}
            className="mt-4 text-center text-gray-700 text-[10px] font-black uppercase tracking-widest hover:text-red-500 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </main>
  )
}