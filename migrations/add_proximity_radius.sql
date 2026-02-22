-- Migration: Add proximityRadiusKm field to Person table
-- Run this in your Supabase SQL Editor

-- Add the column with default value of 5km
ALTER TABLE "Person"
ADD COLUMN IF NOT EXISTS "proximityRadiusKm" INTEGER DEFAULT 5;

-- Add a comment for documentation
COMMENT ON COLUMN "Person"."proximityRadiusKm" IS 'User preferred search radius in kilometers (default: 5km)';

-- Verify the column was added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Person'
AND column_name = 'proximityRadiusKm';
