'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function ActivityCalendar() {
  const [heatMap, setHeatMap] = useState<Record<number, number>>({})
  const [goalDays, setGoalDays] = useState<number[]>([])
  const [loading, setLoading] = useState(true)

  const now = new Date()
  const currentMonthName = now.toLocaleString('default', { month: 'long' })
  const currentYear = now.getFullYear()
  const todayDate = now.getDate()
  const daysInMonth = new Date(currentYear, now.getMonth() + 1, 0).getDate()
  const firstDayOfMonth = new Date(currentYear, now.getMonth(), 1).getDay()

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: splitData } = await supabase.from('training_splits').select('day_of_week').eq('user_id', user.id)
      
      const startOfMonth = new Date(currentYear, now.getMonth(), 1).toISOString()
      const { data: checkInData } = await supabase
        .from('check_ins')
        .select('date, volume_score')
        .eq('user_id', user.id)
        .gte('date', startOfMonth)

      if (splitData) setGoalDays(splitData.map(d => d.day_of_week))
      
      if (checkInData) {
        const scores = checkInData.reduce((acc, curr) => {
          const day = new Date(curr.date + 'T00:00:00').getDate()
          acc[day] = (acc[day] || 0) + (curr.volume_score || 0)
          return acc;
        }, {} as Record<number, number>)
        setHeatMap(scores)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const getHeatClass = (vol: number, day: number) => {
    if (vol === 0) return 'bg-white/5 text-gray-700';
    if (vol < 5000) return 'bg-purple-900/40 text-purple-300 border border-purple-500/20';
    if (vol < 15000) return 'bg-purple-700/60 text-purple-100 border border-purple-500/40';
    return 'bg-purple-500 text-black border-none shadow-[0_0_20px_rgba(168,85,247,0.4)]';
  }

  if (loading) return <div className="p-10 text-center text-[10px] font-black text-gray-500 animate-pulse uppercase tracking-widest">Syncing Heatmap...</div>

  return (
    <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">{currentMonthName} {currentYear}</h3>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-8">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
          <span key={i} className="text-[10px] text-gray-600 font-black text-center">{d}</span>
        ))}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={i} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const vol = heatMap[day] || 0;
          const isToday = day === todayDate;
          const isGoalDay = goalDays.includes(new Date(currentYear, now.getMonth(), day).getDay());
          const isMissed = isGoalDay && vol === 0 && day < todayDate;

          return (
            <div key={i} className="relative aspect-square flex items-center justify-center">
              <div className={`
                w-full h-full rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-700
                ${getHeatClass(vol, day)}
                ${isToday ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black scale-110 z-10' : ''}
                ${isMissed ? 'opacity-30' : ''}
              `}>
                {day}
                {vol > 0 && <span className="absolute -bottom-1 text-[6px] opacity-50">●</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1">Volume Metric</p>
          <p className="text-xl font-black text-purple-500">{Object.values(heatMap).reduce((a,b) => a+b, 0).toLocaleString()} <span className="text-[8px]">lbs</span></p>
        </div>
        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
          <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest mb-1">Workout Intensity</p>
          <div className="flex gap-1 mt-1">
            <div className="w-2 h-2 rounded-full bg-purple-900/40" />
            <div className="w-2 h-2 rounded-full bg-purple-700/60" />
            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_5px_purple]" />
          </div>
        </div>
      </div>
    </div>
  )
}