'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ActivityCalendar() {
  const [completedDays, setCompletedDays] = useState<number[]>([])
  const [goalDays, setGoalDays] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  // Get real date info
  const now = new Date()
  const currentMonthName = now.toLocaleString('default', { month: 'long' })
  const currentYear = now.getFullYear()
  const todayDate = now.getDate()
  
  // Calculate days in current month and starting offset
  const daysInMonth = new Date(currentYear, now.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, now.getMonth(), 1).getDay()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Fetch Goal Days from your split
      const { data: splitData } = await supabase
        .from('training_splits')
        .select('day_of_week')
        .eq('user_id', user.id)

      // 2. Fetch Check-ins for this month
      const startOfMonth = new Date(currentYear, now.getMonth(), 1).toISOString()
      const { data: checkInData } = await supabase
        .from('check_ins')
        .select('date')
        .eq('user_id', user.id)
        .gte('date', startOfMonth)

      if (splitData) {
        setGoalDays(splitData.map(d => d.day_of_week))
      }

      if (checkInData) {
        // Convert ISO dates like "2026-04-06" to just the day number "6"
        const days = checkInData.map(c => new Date(c.date + 'T00:00:00').getDate())
        setCompletedDays(days)
      }
      
      setLoading(false)
    }

    fetchData()
  }, [currentYear, now])

  if (loading) return <div className="p-10 text-center text-gray-500 animate-pulse">Syncing Calendar...</div>

  return (
    <div className="bg-[#111] border border-white/5 rounded-3xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-black text-white italic">{currentMonthName} {currentYear}</h3>
      </div>

    <div className="grid grid-cols-7 gap-2 mb-6 text-center">
      {['Sn', 'M', 'T', 'W', 'Th', 'F', 'S'].map((dayAbbreviation, index) => (
        <span 
          key={`header-${index}`} // Use index or unique string for the key
          className="text-[10px] text-gray-500 font-black"
        >
          {dayAbbreviation}
        </span>
      ))}
        
        {/* Dynamic offset based on what day the 1st of the month falls on */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`offset-${i}`} />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dateObj = new Date(currentYear, now.getMonth(), day);
          const dayOfWeek = dateObj.getDay();

          const isGoalDay = goalDays.includes(dayOfWeek);
          const isCompleted = completedDays.includes(day);
          
          // Only show "Missed" (X) if the day has already passed
          const isMissed = isGoalDay && !isCompleted && day < todayDate;
          const isToday = day === todayDate;

          return (
            <div key={i} className="relative aspect-square flex items-center justify-center">
              <div className={`
                w-full h-full rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500
                ${isCompleted ? 'bg-green-500/20 text-green-400 border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]' : ''}
                ${isMissed ? 'text-red-500/50' : 'text-gray-500'}
                ${isToday ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black text-white' : ''}
              `}>
                {day}
                {isMissed && <span className="absolute -bottom-1 text-[10px] text-red-500 font-black">×</span>}
                {isCompleted && <span className="absolute -bottom-1 text-[10px] text-green-500 font-black">✓</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* STREAK CARDS */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Current Streak</p>
          <p className="text-2xl font-black text-orange-500">{calculateStreak(completedDays)} <span className="text-xs uppercase">days</span></p>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Best Streak</p>
          <p className="text-2xl font-black text-yellow-500">-- <span className="text-xs uppercase text-gray-600">days</span></p>
        </div>
      </div>
    </div>
  )
}

// Simple streak calculator helper
function calculateStreak(days: number[]) {
  if (days.length === 0) return 0;
  const sortedDays = [...days].sort((a, b) => b - a);
  let streak = 0;
  let current = new Date().getDate();

  // If today isn't in the list, check if yesterday was. If neither, streak is 0.
  if (!sortedDays.includes(current) && !sortedDays.includes(current - 1)) return 0;

  for (let i = 0; i < sortedDays.length; i++) {
    if (sortedDays.includes(current)) {
      streak++;
      current--;
    } else {
      break;
    }
  }
  return streak;
}