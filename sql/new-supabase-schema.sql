-- Reset schema (run this if you need to start fresh)
-- DROP TABLE IF EXISTS public.tasks;
-- DROP TABLE IF EXISTS public.users;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  -- Use UUID as primary key, matching auth.users
  id UUID PRIMARY KEY,
  -- Store email for quick access
  email TEXT NOT NULL,
  -- Simple role field
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  -- Metadata
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tasks table with simplified structure
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  -- Store as nullable foreign keys
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  -- Use integer for progress (0-100)
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION update_modified_column();

-- Row Level Security (RLS)
-- Enable RLS on tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.users WHERE id = user_id;
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql;

-- IMPORTANT: Create a policy that allows new users to insert themselves
-- This is crucial for registration to work
CREATE POLICY "Allow users to insert themselves" ON public.users
FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

-- Users policies
-- Everyone can read users (needed for displaying user info)
CREATE POLICY "Anyone can read users" ON public.users
FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE USING (auth.uid() = id);

-- Admin can update any user
CREATE POLICY "Admins can update any user" ON public.users
FOR UPDATE USING (is_admin(auth.uid()));

-- Admin can delete users
CREATE POLICY "Admins can delete users" ON public.users
FOR DELETE USING (is_admin(auth.uid()));

-- Tasks policies
-- Everyone can read tasks (filtering will happen in the application)
CREATE POLICY "Anyone can read tasks" ON public.tasks
FOR SELECT USING (true);

-- Users can insert tasks
CREATE POLICY "Users can insert tasks" ON public.tasks
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Users can update tasks they created or are assigned to
CREATE POLICY "Users can update own tasks" ON public.tasks
FOR UPDATE USING (
  auth.uid() = created_by OR 
  auth.uid() = assigned_to OR
  is_admin(auth.uid())
);

-- Admin can delete tasks
CREATE POLICY "Admins can delete tasks" ON public.tasks
FOR DELETE USING (is_admin(auth.uid()));

-- Users can delete their own tasks
CREATE POLICY "Users can delete own tasks" ON public.tasks
FOR DELETE USING (auth.uid() = created_by);
