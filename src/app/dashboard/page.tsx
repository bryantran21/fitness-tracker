'use client'

import { useState } from 'react'
import ActivityCalendar from '../../components/ActivityCalender'
import SplitEditor from '@/components/SplitEditor'

export default function DashboardPage() {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <main className="min-h-screen bg-black text-white p-4 pb-24 max-w-md mx-auto">
      {/* TOP NAV */}
      <div className="flex justify-between items-center py-6">
        <h1 className="text-2xl font-black italic tracking-tighter">
          IRON <span className="text-purple-500 text-3xl">LOG</span>
        </h1>
        <div className="bg-white/10 p-2 rounded-full w-10 h-10 flex items-center justify-center border border-white/10">
          <span className="text-xs font-bold">BT</span>
        </div>
      </div>

      {isEditing ? (
        /* --- THE EDITOR VIEW --- */
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-300">
          <button 
            onClick={() => setIsEditing(false)}
            className="text-gray-500 text-sm font-bold flex items-center gap-2 mb-2"
          >
            ← Back to Dashboard
          </button>
          <SplitEditor onSave={() => setIsEditing(false)} />
        </div>
      ) : (
        /* --- THE MAIN VIEW --- */
        <div className="flex flex-col gap-4 animate-in fade-in duration-500">
          
          {/* 1. THE MAIN ACTION (Check-in) */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8">
            <p className="text-purple-400 text-xs font-black mb-1 uppercase tracking-widest">Today's Session</p>
            <h2 className="text-3xl font-black mb-6">Push Day A</h2>
            <button className="w-full py-5 bg-white text-black text-lg font-black rounded-2xl active:scale-95 transition-transform shadow-[0_10px_30px_rgba(255,255,255,0.1)]">
              CHECK IN
            </button>
          </div>

          {/* 2. THE TRACKER (Calendar) */}
          <ActivityCalendar />

          {/* 3. THE PLANNER BUTTON (Triggers the Editor) */}
          <div 
            onClick={() => setIsEditing(true)}
            className="bg-[#111] border border-white/5 rounded-3xl p-6 flex justify-between items-center cursor-pointer active:bg-white/5 transition-colors"
          >
            <div>
              <h3 className="font-bold text-lg">Edit Training Split</h3>
              <p className="text-xs text-gray-500">5 days / week scheduled</p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}