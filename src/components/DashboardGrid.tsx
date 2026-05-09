// src/components/DashboardGrid.tsx
'use client'

import { motion } from 'framer-motion'
import { Calendar, BarChart3, Target, ArrowRight } from 'lucide-react'

interface GridProps {
  onStartWorkout?: () => void;
  todaySplit?: any;
  userSplits?: any[];
  consistencyScore?: number;
}

export default function DashboardGrid({ 
  onStartWorkout, 
  todaySplit, 
  userSplits = [], 
  consistencyScore = 0 
}: GridProps) {
  
  // Create a set of day indices that have muscle groups assigned in the DB
  const activeDayIndices = new Set(
    userSplits
      .filter(s => s.muscle_groups && s.muscle_groups.length > 0)
      .map(s => s.day_of_week)
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4 h-full max-w-6xl mx-auto p-4 font-sans">

      {/* PLAN WORKOUT - Dynamic based on DB */}
      <motion.div 
        whileHover={{ translateY: -2 }}
        className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between hover:border-white/20 transition-all cursor-pointer group"
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-black italic uppercase tracking-widest text-gray-400 group-hover:text-white transition-colors">Plan Workout</h3>
            <p className="text-[10px] text-gray-600 uppercase font-bold mt-1">Weekly Split</p>
          </div>
          <Calendar size={18} className="text-gray-700 group-hover:text-purple-500 transition-colors" />
        </div>
        
        <div className="mt-8 flex gap-1.5">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className={`h-10 flex-1 rounded-xl border transition-all flex items-center justify-center text-[10px] font-black ${
              activeDayIndices.has(i) 
                ? 'bg-purple-500/10 border-purple-500/20 text-purple-400 shadow-[0_0_10px_rgba(159,85,255,0.1)]' 
                : 'bg-white/5 border-white/5 text-gray-700'
            }`}>
              {day}
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* CHECK-IN */}
      <motion.div 
        onClick={onStartWorkout}
        whileHover={{ translateY: -2 }}
        className="md:col-span-2 md:row-span-1 bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-purple-500/30 transition-all group relative overflow-hidden cursor-pointer"
      >
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full group-hover:bg-purple-600/20 transition-all"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
             <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Ready to sync</span>
          </div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Check-in</h2>
          <p className="text-gray-500 font-bold mt-2 uppercase text-xs tracking-tight">
            Next up: <span className="text-white">{todaySplit?.day_name || "Recovery"}</span>
          </p>
        </div>
        <div className="mt-8 flex items-center justify-between relative z-10">
          <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Tap to start session</span>
          <div className="bg-white text-black h-14 w-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
             <ArrowRight size={24} strokeWidth={3} />
          </div>
        </div>
      </motion.div>

      {/* INTENSITY - Under Construction */}
      <motion.div className="md:col-span-1 bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="bg-purple-600 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-[0.4em] shadow-[0_0_20px_rgba(159,85,255,0.4)] transition-transform group-hover:scale-110">
            ** Under Construction **
          </div>
        </div>
        <div className="flex justify-between items-start mb-4 blur-[3px]"><h3 className="text-sm font-black italic uppercase tracking-widest text-gray-400">Intensity</h3><BarChart3 size={18} /></div>
        <div className="h-24 w-full flex items-end gap-1 px-1 blur-[5px]">{[40, 70, 45, 90, 65, 80, 50].map((h, i) => (<div key={i} style={{ height: `${h}%` }} className="w-full rounded-t-lg bg-white/10" />))}</div>
      </motion.div>

      {/* CONSISTENCY - Dynamic Score */}
      <motion.div 
        whileHover={{ translateY: -2 }}
        className="md:col-span-2 bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 flex items-center justify-between hover:border-white/20 transition-all group"
      >
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 flex items-center justify-center">
             <Target size={24} className="text-purple-500" />
          </div>
          <div>
            <h3 className="text-white text-xl font-black italic uppercase tracking-tighter">Consistency</h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">30-Day commitment</p>
          </div>
        </div>
        <div className="text-6xl font-black italic text-white tracking-tighter">
          {consistencyScore}<span className="text-purple-500 text-3xl">%</span>
        </div>
      </motion.div>
    </div>
  )
}