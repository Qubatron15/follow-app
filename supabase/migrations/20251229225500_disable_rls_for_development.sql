-- ============================================================================
-- Migration: Temporarily Disable RLS for Development
-- Created: 2025-12-29 22:55:00 UTC
-- Purpose: Disable Row Level Security for development and testing
-- 
-- IMPORTANT: This is for development only!
-- In production, you should enable RLS and implement proper authentication.
-- ============================================================================

-- Disable Row Level Security on threads table for development
alter table threads disable row level security;

-- Disable Row Level Security on transcripts table for development  
alter table transcripts disable row level security;

-- Disable Row Level Security on action_points table for development
alter table action_points disable row level security;

-- ============================================================================
-- DEVELOPMENT MIGRATION COMPLETE
-- 
-- Summary of changes:
-- - Disabled RLS on threads, transcripts, and action_points tables
-- - This allows API testing without authentication
-- - Remember to re-enable RLS before production deployment!
-- ============================================================================
