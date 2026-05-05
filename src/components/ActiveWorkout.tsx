'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  DndContext, 
  closestCenter, 
  TouchSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from '@dnd-kit/core'
import { 
  arrayMove, 
  SortableContext, 
  verticalListSortingStrategy, 
  useSortable 
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// --- SORTABLE ITEM COMPONENT ---
function SortableWorkout({ item, idx, onRemove, onAddSet, onUpdateSet, onTypeChange }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] p-8 mb-6 shadow-2xl relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-600/5 blur-3xl rounded-full"></div>

      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-gray-700 hover:text-purple-500 transition-colors">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><path d="M7 7h2v2H7V7zm0 4h2v2H7v-2zm4-4h2v2h-2V7zm0 4h2v2h-2v-2z"/></svg>
          </div>
          <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{item.name}</h3>
        </div>
        <button onClick={() => onRemove(idx)} className="text-[10px] font-black text-red-900 uppercase tracking-widest hover:text-red-500 transition-colors">Remove</button>
      </div>

      <div className="flex gap-2 mb-8">
        {['Cable', 'Machine', 'Free'].map(v => (
          <button 
            key={v}
            onClick={() => onTypeChange(idx, v)}
            className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase border transition-all ${
              item.type === v ? 'bg-white text-black border-white shadow-lg' : 'bg-transparent border-white/5 text-gray-600 hover:border-white/20'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {item.sets.map((set: any, sIdx: number) => (
          <div key={sIdx} className="flex gap-3 items-center animate-in fade-in slide-in-from-left-2">
            <span className="w-8 text-[10px] font-black text-purple-500 italic">#{sIdx + 1}</span>
            <div className="flex-1 relative">
              <input 
                type="number" placeholder="0" inputMode="numeric"
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-center font-black text-xl outline-none focus:border-purple-500 transition-all"
                value={set.weight}
                onChange={(e) => onUpdateSet(idx, sIdx, 'weight', e.target.value)}
              />
              <span className="absolute top-2 left-4 text-[8px] font-black text-gray-700 uppercase tracking-widest">LBS</span>
            </div>
            <div className="flex-1 relative">
              <input 
                type="number" placeholder="0" inputMode="numeric"
                className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl text-center font-black text-xl outline-none focus:border-purple-500 transition-all"
                value={set.reps}
                onChange={(e) => onUpdateSet(idx, sIdx, 'reps', e.target.value)}
              />
              <span className="absolute top-2 left-4 text-[8px] font-black text-gray-700 uppercase tracking-widest">REPS</span>
            </div>
          </div>
        ))}
        <button 
          onClick={() => onAddSet(idx)} 
          className="w-full py-4 mt-2 border-2 border-dashed border-white/5 rounded-[1.5rem] text-[10px] font-black uppercase text-gray-700"
        >
          + Add Set
        </button>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function ActiveWorkout({ onFinished }: { onFinished: () => void }) {
  const [exerciseDB, setExerciseDB] = useState<any[]>([])
  const [todaySplit, setTodaySplit] = useState<any>(null)
  const [workoutQueue, setWorkoutQueue] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [isLogging, setIsLogging] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserEmail(user.email || '')
      
      const today = new Date().getDay()

      const { data: split } = await supabase
        .from('training_splits')
        .select('*')
        .eq('user_id', user?.id)
        .eq('day_of_week', today)
        .maybeSingle()

      const { data: exData } = await supabase.from('exercises').select('*')

      setTodaySplit(split)
      setExerciseDB(exData || [])
      setLoading(false)
    }
    fetchInitialData()
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setWorkoutQueue((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addToQueue = (ex: any) => {
    setWorkoutQueue([...workoutQueue, { 
      id: Math.random().toString(), 
      name: ex.label, 
      type: 'Free', 
      sets: [{weight: '', reps: ''}] 
    }])
    setSearch('')
  }

  // --- LOGIC: FINISH AND LOG ---
  const handleFinishSession = async () => {
    if (workoutQueue.length === 0) return;
    setIsLogging(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Calculate Total Volume Metric (Weight * Reps)
    const totalVolume = workoutQueue.reduce((acc, exercise) => {
      const exerciseVolume = exercise.sets.reduce((sAcc: number, set: any) => {
        return sAcc + (Number(set.weight || 0) * Number(set.reps || 0));
      }, 0);
      return acc + exerciseVolume;
    }, 0);

    // Log the check-in to Supabase
    const { error } = await supabase
      .from('check_ins')
      .insert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        volume_score: totalVolume // The Heat Metric
      });

    if (!error) {
      onFinished(); // Trigger refresh back in Dashboard
    } else {
      console.error("Supabase Error:", error.message);
      setIsLogging(false);
    }
  };

  const filteredExercises = exerciseDB.filter(ex => 
    ex.label.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-48 max-w-md mx-auto overflow-x-hidden font-sans relative">
      
      {/* TOP NAV */}
      <div className="flex justify-between items-center py-6 px-2 mb-4">
        <button 
          onClick={onFinished}
          className="px-5 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all"
        >
          ← Cancel
        </button>
        <div className="bg-white/10 p-2 rounded-full w-10 h-10 flex items-center justify-center border border-white/10">
          <span className="text-[10px] font-black">{userEmail?.substring(0, 2).toUpperCase()}</span>
        </div>
      </div>

      {/* SEARCH / DROPDOWN AREA */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 mb-10 shadow-2xl relative z-[100] overflow-visible">
        <h2 className="text-xl font-black italic uppercase tracking-tighter mb-2">
          {todaySplit?.day_name || "Add Lift"}
        </h2>
        
        {todaySplit?.muscle_groups && (
          <p className="text-[10px] text-purple-500 font-black uppercase tracking-widest mb-6 italic">
            Focus: {todaySplit.muscle_groups.join(' + ')}
          </p>
        )}

        <div className="relative">
          <input 
            placeholder="Type to search..."
            className="w-full p-5 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm outline-none focus:border-purple-500 transition-all shadow-inner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,1)] z-[110] max-h-60 overflow-y-auto">
              {filteredExercises.length > 0 ? (
                filteredExercises.map((ex) => (
                  <button 
                    key={ex.id}
                    onClick={() => addToQueue(ex)}
                    className="w-full p-4 text-left border-b border-white/5 hover:bg-purple-600/20 transition-colors flex justify-between items-center group"
                  >
                    <span className="font-black uppercase italic text-sm tracking-tight">{ex.label}</span>
                    <span className="text-[8px] text-gray-600 group-hover:text-purple-400 font-mono uppercase">{ex.category}</span>
                  </button>
                ))
              ) : (
                <button 
                  onClick={() => addToQueue({ label: search })}
                  className="w-full p-4 text-left text-purple-400 font-black uppercase italic text-sm hover:bg-white/5"
                >
                  + Add custom "{search}"
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DRAGGABLE QUEUE */}
      <div className="min-h-[200px] relative z-10">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={workoutQueue.map(i => i.id)} strategy={verticalListSortingStrategy}>
            {workoutQueue.map((item, idx) => (
              <SortableWorkout 
                key={item.id} 
                item={item} 
                idx={idx} 
                onRemove={(i: number) => setWorkoutQueue(workoutQueue.filter((_, index) => index !== i))}
                onAddSet={(i: number) => {
                  const n = [...workoutQueue]; n[i].sets.push({weight:'', reps:''}); setWorkoutQueue(n);
                }}
                onUpdateSet={(wIdx: number, sIdx: number, field: string, val: string) => {
                  const n = [...workoutQueue]; n[wIdx].sets[sIdx][field] = val; setWorkoutQueue(n);
                }}
                onTypeChange={(i: number, type: string) => {
                  const n = [...workoutQueue]; n[i].type = type; setWorkoutQueue(n);
                }}
              />
            ))}
          </SortableContext>
        </DndContext>
        
        {workoutQueue.length === 0 && !loading && (
          <div className="text-center py-20 opacity-20 italic font-black uppercase tracking-[0.2em] text-sm">
            Queue is empty
          </div>
        )}
      </div>

      {/* FIXED FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black to-transparent z-[150]">
        <button 
          onClick={handleFinishSession}
          disabled={workoutQueue.length === 0 || isLogging}
          className="w-full max-w-md mx-auto py-6 bg-white text-black font-black rounded-[2rem] text-xl uppercase italic tracking-tighter shadow-2xl active:scale-95 transition-all disabled:opacity-20 disabled:grayscale"
        >
          {isLogging ? "SYNCING SESSION..." : "FINISH & LOG SESSION"}
        </button>
      </div>
    </div>
  );
}