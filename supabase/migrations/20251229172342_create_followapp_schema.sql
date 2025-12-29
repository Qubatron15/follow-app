-- ============================================================================
-- Migration: Create FollowApp Database Schema
-- Created: 2025-12-29 17:23:42 UTC
-- Purpose: Initial schema creation for FollowApp MVP
-- 
-- Tables affected:
-- - threads: User conversation threads with name uniqueness constraint
-- - transcripts: Conversation transcripts linked to threads
-- - action_points: Action items extracted from conversations
--
-- Special features:
-- - Row Level Security (RLS) enabled on all custom tables
-- - Trigger to limit max 20 threads per user
-- - Unique constraint on thread names per user (case-sensitive)
-- - Cascading deletes to maintain referential integrity
-- ============================================================================

-- Enable required extensions (pgcrypto is enabled by default in Supabase)
-- No additional extensions needed for this schema

-- ============================================================================
-- TABLE: threads
-- Purpose: Store user conversation threads with unique names per user
-- ============================================================================

create table threads (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    name varchar(20) not null check (char_length(name) between 1 and 20),
    created_at timestamptz not null default now()
);

-- Add unique constraint for thread names per user (case-sensitive)
create unique index uniq_threads_user_name on threads (user_id, name);

-- Add index for faster user-based queries
create index fk_threads_user on threads (user_id);

-- Enable Row Level Security
alter table threads enable row level security;

-- Create RLS policy for threads - users can only access their own threads
create policy "Threads: owner select access" on threads
    for select using (auth.uid() = user_id);

create policy "Threads: owner insert access" on threads
    for insert with check (auth.uid() = user_id);

create policy "Threads: owner update access" on threads
    for update using (auth.uid() = user_id);

create policy "Threads: owner delete access" on threads
    for delete using (auth.uid() = user_id);

-- ============================================================================
-- TRIGGER FUNCTION: Enforce maximum 20 threads per user
-- Purpose: Prevent users from creating more than 20 threads
-- ============================================================================

create or replace function enforce_threads_limit()
returns trigger language plpgsql as $$
begin
    -- Check if user already has 20 or more threads
    if (select count(*) from threads where user_id = new.user_id) >= 20 then
        raise exception 'User may have max 20 threads';
    end if;
    return new;
end;
$$;

-- Create trigger to enforce threads limit before insert
create trigger threads_limit_per_user_bi
    before insert on threads
    for each row execute function enforce_threads_limit();

-- ============================================================================
-- TABLE: transcripts
-- Purpose: Store conversation transcripts linked to threads
-- ============================================================================

create table transcripts (
    id uuid primary key default gen_random_uuid(),
    thread_id uuid not null references threads(id) on delete cascade,
    content text not null,
    created_at timestamptz not null default now()
);

-- Add index for faster thread-based queries
create index fk_transcripts_thread on transcripts (thread_id);

-- Enable Row Level Security
alter table transcripts enable row level security;

-- Create RLS policies for transcripts - access through parent thread ownership
create policy "Transcripts: owner select access" on transcripts
    for select using (
        exists (
            select 1 from threads t
            where t.id = thread_id and t.user_id = auth.uid()
        )
    );

create policy "Transcripts: owner insert access" on transcripts
    for insert with check (
        exists (
            select 1 from threads t
            where t.id = thread_id and t.user_id = auth.uid()
        )
    );

create policy "Transcripts: owner update access" on transcripts
    for update using (
        exists (
            select 1 from threads t
            where t.id = thread_id and t.user_id = auth.uid()
        )
    );

create policy "Transcripts: owner delete access" on transcripts
    for delete using (
        exists (
            select 1 from threads t
            where t.id = thread_id and t.user_id = auth.uid()
        )
    );

-- ============================================================================
-- TABLE: action_points
-- Purpose: Store action items extracted from conversations
-- ============================================================================

create table action_points (
    id uuid primary key default gen_random_uuid(),
    thread_id uuid not null references threads(id) on delete cascade,
    title varchar(255) not null,
    is_completed boolean not null default false,
    created_at timestamptz not null default now()
);

-- Add index for faster thread-based queries
create index fk_action_points_thread on action_points (thread_id);

-- Enable Row Level Security
alter table action_points enable row level security;

-- Create RLS policies for action_points - access through parent thread ownership
create policy "Action Points: owner select access" on action_points
    for select using (
        exists (
            select 1 from threads t
            where t.id = thread_id and t.user_id = auth.uid()
        )
    );

create policy "Action Points: owner insert access" on action_points
    for insert with check (
        exists (
            select 1 from threads t
            where t.id = thread_id and t.user_id = auth.uid()
        )
    );

create policy "Action Points: owner update access" on action_points
    for update using (
        exists (
            select 1 from threads t
            where t.id = thread_id and t.user_id = auth.uid()
        )
    );

create policy "Action Points: owner delete access" on action_points
    for delete using (
        exists (
            select 1 from threads t
            where t.id = thread_id and t.user_id = auth.uid()
        )
    );

-- ============================================================================
-- MIGRATION COMPLETE
-- 
-- Summary of created objects:
-- - 3 tables: threads, transcripts, action_points
-- - 1 trigger function: enforce_threads_limit()
-- - 1 trigger: threads_limit_per_user_bi
-- - 3 unique indexes: uniq_threads_user_name, fk_threads_user, fk_transcripts_thread, fk_action_points_thread
-- - 12 RLS policies: 4 per table (select, insert, update, delete)
-- 
-- All tables have RLS enabled and proper cascading foreign key relationships.
-- The schema is ready for production use with Supabase.
-- ============================================================================
