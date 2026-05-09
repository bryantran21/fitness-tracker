'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, GripVertical, Trash2, Dumbbell, Zap, Activity, Sparkles } from 'lucide-react'

// --- SORTABLE ITEM COMPONENT ---
function SortableWorkout({ item, idx, onRemove, onAddSet, onUpdateSet, onTypeChange }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      ref={setNodeRef} 
      style={style} 
      className="bg-[#0a0a0a] border border-white/5 rounded-[2rem] p-6 mb-4 shadow-2xl relative overflow-hidden group"
    >
      <div className="absolute -top-10 -right-10 w-24 h-24 bg-purple-600/5 blur-3xl rounded-full"></div>

      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-2 text-gray-700 hover:text-purple-500 transition-colors">
            <GripVertical size={20} />
          </div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none">{item.name}</h3>
        </div>
        <button onClick={() => onRemove(idx)} className="p-2 text-gray-800 hover:text-red-500 transition-colors">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {['Cable', 'Machine', 'Free'].map(v => (
          <button 
            key={v}
            onClick={() => onTypeChange(idx, v)}
            className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${
              item.type === v ? 'bg-white text-black border-white shadow-lg' : 'bg-transparent border-white/5 text-gray-600 hover:border-white/20'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {item.sets.map((set: any, sIdx: number) => (
          <div key={sIdx} className="flex gap-3 items-center">
            <span className="w-8 text-[10px] font-black text-purple-500 italic">#{sIdx + 1}</span>
            <div className="flex-1 relative">
              <input 
                type="number" placeholder="0" inputMode="numeric"
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-center font-black text-lg outline-none focus:border-purple-500/50 transition-all"
                value={set.weight}
                onChange={(e) => onUpdateSet(idx, sIdx, 'weight', e.target.value)}
              />
              <span className="absolute top-1.5 left-3 text-[7px] font-black text-gray-700 uppercase">LBS</span>
            </div>
            <div className="flex-1 relative">
              <input 
                type="number" placeholder="0" inputMode="numeric"
                className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-center font-black text-lg outline-none focus:border-purple-500/50 transition-all"
                value={set.reps}
                onChange={(e) => onUpdateSet(idx, sIdx, 'reps', e.target.value)}
              />
              <span className="absolute top-1.5 left-3 text-[7px] font-black text-gray-700 uppercase">REPS</span>
            </div>
          </div>
        ))}
        <button 
          onClick={() => onAddSet(idx)} 
          className="w-full py-3 mt-1 border border-dashed border-white/5 rounded-xl text-[10px] font-black uppercase text-gray-700 hover:border-white/20 hover:text-gray-400 transition-all"
        >
          + Add Set
        </button>
      </div>
    </motion.div>
  );
}

// --- MAIN COMPONENT ---
export default function ActiveWorkout({ onFinished }: { onFinished: () => void }) {
  const [exerciseDB, setExerciseDB] = useState<any[]>([])
  const [todaySplit, setTodaySplit] = useState<any>(null)
  const [workoutQueue, setWorkoutQueue] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [isLogging, setIsLogging] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  const sensors = useSensors(useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }));

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserEmail(user.email || '')
      
      const today = new Date().getDay()
      const { data: split } = await supabase.from('training_splits').select('*').eq('user_id', user?.id).eq('day_of_week', today).maybeSingle()
      const { data: exData } = await supabase.from('exercises').select('*')

      setTodaySplit(split)
      setExerciseDB(exData || [])
    }
    fetchInitialData()
  }, [])

  const categories = useMemo(() => ['All', ...new Set(exerciseDB.map(ex => ex.category))], [exerciseDB]);

  const filteredExercises = useMemo(() => {
    return exerciseDB.filter(ex => 
      ex.label.toLowerCase().includes(search.toLowerCase()) &&
      (selectedCategory === 'All' || ex.category === selectedCategory)
    )
  }, [search, selectedCategory, exerciseDB]);

  const addToQueue = (name: string) => {
    setWorkoutQueue([...workoutQueue, { 
      id: Math.random().toString(), 
      name: name, 
      type: 'Free', 
      sets: [{weight: '', reps: ''}] 
    }])
    setSearch('')
  }

  // --- NEW LOGIC: PERSIST NEW EXERCISE TO DB ---
  const handleCreateNewExercise = async () => {
      if (!search) return;
      
      const newName = search;
      // Add to UI immediately for that "snappy" feel
      addToQueue(newName);

      const { data, error } = await supabase
        .from('exercises')
        .insert({ 
          label: newName, 
          category: selectedCategory === 'All' ? 'Custom' : selectedCategory 
        })
        .select(); // Remove .single() to see the full array return

      if (error) {
        console.error("❌ DATABASE INSERT FAILED:", error.message);
        console.error("Error Details:", error.details);
      } else {
        console.log("✅ Exercise saved to DB:", data);
        setExerciseDB([...exerciseDB, ...data]);
      }
    };
  const handleFinishSession = async () => {
    if (workoutQueue.length === 0) return;
    setIsLogging(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const totalVolume = Math.round(workoutQueue.reduce((acc, ex) => 
      acc + ex.sets.reduce((sAcc: number, s: any) => sAcc + (parseFloat(s.weight) || 0) * (parseFloat(s.reps) || 0), 0)
    , 0));

    try {
      await supabase.from('check_ins').insert({ user_id: user.id, date: new Date().toISOString().split('T')[0], volume_score: totalVolume });
      const logs = workoutQueue.map(ex => ({ user_id: user.id, exercise_name: ex.name, equipment_type: ex.type, sets: ex.sets }));
      await supabase.from('workout_logs').insert(logs);
      onFinished();
    } catch (e) { setIsLogging(false); }
  };

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

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-48 max-w-md mx-auto font-sans relative selection:bg-purple-500/30">
      
      {/* HEADER */}
      <div className="flex justify-between items-center py-6 mb-2">
        <button onClick={onFinished} className="text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-white transition-colors">
          Cancel Session
        </button>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full">
          <Activity size={12} className="text-purple-500" />
          <span className="text-[10px] font-black uppercase tracking-widest">Active Log</span>
        </div>
      </div>

      {/* REFINED ADD SECTION */}
      <div className="bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-8 mb-8 shadow-2xl relative overflow-visible">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none">
              {todaySplit?.day_name || "Custom Lift"}
            </h2>
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">
              Add movements to your queue
            </p>
          </div>
          <div className="w-10 h-10 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Plus size={20} className="text-purple-500" />
          </div>
        </div>

        {/* Search Input */}
        <div className="relative group mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-purple-500 transition-colors" size={18} />
          <input 
            placeholder="Search exercises..."
            className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm outline-none focus:border-purple-500/50 focus:bg-white/[0.07] transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Category Quick-Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border transition-all ${
                selectedCategory === cat ? 'bg-purple-500 border-purple-500 text-white' : 'bg-transparent border-white/5 text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Results Dropdown */}
        <AnimatePresence>
          {search.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-[calc(100%-20px)] left-0 right-0 mx-4 bg-[#111] border border-white/10 rounded-2xl overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-[110] max-h-64 overflow-y-auto backdrop-blur-xl"
            >
              {filteredExercises.length > 0 ? (
                filteredExercises.map((ex) => (
                  <button 
                    key={ex.id}
                    onClick={() => addToQueue(ex.label)}
                    className="w-full p-4 text-left border-b border-white/5 hover:bg-purple-600/20 transition-colors flex justify-between items-center group"
                  >
                    <span className="font-black uppercase italic text-sm tracking-tight">{ex.label}</span>
                    <span className="text-[8px] text-gray-600 font-mono uppercase bg-white/5 px-2 py-1 rounded-md">{ex.category}</span>
                  </button>
                ))
              ) : (
                <button 
                  onClick={handleCreateNewExercise}
                  className="w-full p-5 text-left hover:bg-purple-600/10 transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles size={14} className="text-purple-400" />
                    <span className="font-black uppercase italic text-sm text-purple-400">Create "{search}"</span>
                  </div>
                  <Plus size={14} className="text-purple-400" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* WORKOUT QUEUE */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={workoutQueue.map(i => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
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
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>

      {workoutQueue.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 opacity-20 text-center">
          <Dumbbell size={48} className="mb-4" />
          <p className="font-black uppercase italic tracking-widest text-xs">Waiting for your first lift</p>
        </div>
      )}

      {/* ACTION FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-[150]">
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={handleFinishSession}
          disabled={workoutQueue.length === 0 || isLogging}
          className="w-full max-w-md mx-auto py-6 bg-purple-600 text-white font-black rounded-[2rem] text-xl uppercase italic tracking-tighter shadow-[0_20px_50px_rgba(159,85,255,0.3)] disabled:opacity-20 disabled:grayscale transition-all flex items-center justify-center gap-3"
        >
          {isLogging ? (
            <Zap className="animate-pulse" />
          ) : (
            <>Complete Session</>
          )}
        </motion.button>
      </div>
    </div>
  );
}