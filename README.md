![Vercel Deployment](https://vercelbadge.vercel.app/api/bryantran21/fitness-tracker)
🦾 IRON LOG
A high-intensity fitness synchronization engine.

Iron Log is a performance-focused workout tracker built with Next.js 14, Supabase, and Framer Motion. It features a glassmorphic "Lyrin" aesthetic, real-time volume tracking, and an interactive training split architect.

⚡ Features
Active Session Sync: Real-time workout logging with automatic volume scoring.

Training Split Architect: Interactive weekly split configuration with muscle-group tagging.

Performance Heatmap: A visual intensity calendar that tracks consistency and total tonnage.

Universal Library: Pre-populated database of 60+ compound and isolation movements.

Deployment Security: Hardened with Supabase RLS and restricted self-signup protocols.

🛠️ Tech Stack
Framework: Next.js 14 (App Router)

Database & Auth: Supabase

Styling: Tailwind CSS

Animations: Framer Motion

Icons: Lucide React

🚀 Getting Started
1. Environment Configuration
Create a .env.local file in the root directory and add your Supabase credentials:

Bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
2. Database Setup
Run the following SQL in your Supabase SQL Editor to initialize the exercise library and constraints:

SQL
ALTER TABLE public.exercises ADD CONSTRAINT exercises_label_key UNIQUE (label);
-- Run the population script provided in the documentation
3. Development
Bash
npm install
npm run dev
Open http://localhost:3000 to view the engine.

🛡️ Security Note
Self-signup is restricted via the Supabase Auth dashboard to ensure this remains a private tracking tool. To add new operators, manually insert their email into the allowed_users table or briefly enable provider sign-ups.
