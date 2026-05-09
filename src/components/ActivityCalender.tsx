'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trophy, Hash, Zap } from 'lucide-react'

export default function ActivityCalendar() {
  const [heatMap, setHeatMap] = useState<Record<number, number>>({})
  const [goalDays, setGoalDays] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  
  // --- NEW STATE FOR HISTORY OVERLAY ---
  const [selectedDay, setSelectedDay] = useState<number | null>(null)
  const [dayDetails, setDayDetails] = useState<any[]>([])
  const [fetchingDetails, setFetchingDetails] = useState(false)

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
  }, [currentYear, now])

  // --- LOGIC: FETCH SPECIFIC WORKOUTS FOR CLICKED DAY ---
  const handleDayClick = async (day: number, vol: number) => {
    if (vol === 0) return;
    setSelectedDay(day);
    setFetchingDetails(true);

    const dateString = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .gte('created_at', `${dateString}T00:00:00`)
      .lte('created_at', `${dateString}T23:59:59`)
      .order('created_at', { ascending: true });

    if (!error) setDayDetails(data || []);
    setFetchingDetails(false);
  }

  const getHeatClass = (vol: number) => {
    if (vol === 0) return 'bg-white/5 text-gray-700';
    if (vol < 5000) return 'bg-purple-900/40 text-purple-300 border border-purple-500/20';
    if (vol < 15000) return 'bg-purple-700/60 text-purple-100 border border-purple-500/40';
    return 'bg-purple-500 text-black border-none shadow-[0_0_20px_rgba(168,85,247,0.4)]';
  }

  if (loading) return <div className="p-10 text-center text-[10px] font-black text-gray-500 animate-pulse uppercase tracking-widest">Syncing Heatmap...</div>

  return (
    <div className="relative">
      <div className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
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
                <button 
                  onClick={() => handleDayClick(day, vol)}
                  disabled={vol === 0}
                  className={`
                    w-full h-full rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300
                    ${getHeatClass(vol)}
                    ${isToday ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black scale-110 z-10' : ''}
                    ${isMissed ? 'opacity-30' : ''}
                    ${vol > 0 ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'cursor-default'}
                  `}
                >
                  {day}
                </button>
              </div>
            );
          })}
        </div>

        {/* STATS FOOTER */}
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

      {/* --- DETAILED HISTORY OVERLAY --- */}
      <AnimatePresence>
        {selectedDay && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDay(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            />
            
            {/* Content Card */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#0a0a0a] border-t border-white/10 rounded-t-[3rem] z-[110] p-8 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-purple-500 text-[10px] font-black uppercase tracking-widest italic">Historical Log</p>
                  <h2 className="text-3xl font-black italic uppercase tracking-tighter">
                    {currentMonthName} {selectedDay}
                  </h2>
                </div>
                <button onClick={() => setSelectedDay(null)} className="p-4 bg-white/5 rounded-full border border-white/10 text-gray-400">
                  <X size={20} />
                </button>
              </div>

              {fetchingDetails ? (
                <div className="py-20 text-center animate-pulse text-[10px] font-black text-gray-700 tracking-[0.3em]">RETRIVING DATA...</div>
              ) : dayDetails.length > 0 ? (
                <div className="space-y-6">
                  {dayDetails.map((log, lIdx) => (
                    <div key={lIdx} className="relative pl-6 border-l-2 border-purple-500/20 py-2 group">
                      <div className="absolute -left-[9px] top-4 w-4 h-4 bg-black border-2 border-purple-500 rounded-full group-hover:scale-125 transition-transform" />
                      
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-lg font-black uppercase italic tracking-tight">{log.exercise_name}</h4>
                        <span className="text-[8px] bg-white/5 px-2 py-1 rounded-md text-gray-500 font-mono uppercase">{log.equipment_type}</span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {log.sets.map((set: any, sIdx: number) => (
                          <div key={sIdx} className="bg-white/5 border border-white/5 rounded-xl px-4 py-2 flex gap-3 items-center">
                            <span className="text-purple-500 font-black italic text-[10px]">#{sIdx + 1}</span>
                            <div className="flex flex-col">
                              <span className="text-white font-black text-sm">{set.weight}<span className="text-[8px] text-gray-600 ml-0.5">lbs</span></span>
                              <span className="text-gray-500 font-black text-[9px] leading-none">{set.reps} reps</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center opacity-30 italic font-black text-sm uppercase">No detailed logs found for this day</div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}