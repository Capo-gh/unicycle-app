-- Migration: Add email verification and transactions tracking
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- PART 1: Add email verification fields to users table
-- ============================================

-- Add verification_token column (nullable, for email verification)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);

-- Add token_created_at column (nullable, tracks when verification token was created)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS token_created_at TIMESTAMP WITH TIME ZONE;

-- Update existing users to be verified (so they don't lose access)
UPDATE users
SET is_verified = TRUE
WHERE is_verified IS NULL OR is_verified = FALSE;

-- ============================================
-- PART 2: Create transactions table
-- ============================================

CREATE TYPE transaction_status AS ENUM ('interested', 'agreed', 'completed', 'cancelled');

CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    listing_id INTEGER NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    buyer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seller_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status transaction_status NOT NULL DEFAULT 'interested',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_listing ON transactions(listing_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- Create updated_at trigger for transactions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 3: Add useful indexes to existing tables (optional but recommended)
-- ============================================

-- Improve performance for filtering/searching listings
CREATE INDEX IF NOT EXISTS idx_listings_university ON listings(university);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_is_active ON listings(is_active);
CREATE INDEX IF NOT EXISTS idx_listings_is_sold ON listings(is_sold);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at);

-- Improve performance for user lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_university ON users(university);

-- ============================================
-- Verification
-- ============================================

-- Check if columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('verification_token', 'token_created_at');

-- Check if transactions table was created
SELECT table_name
FROM information_schema.tables
WHERE table_name = 'transactions';

-- Check transaction count (should be 0 initially)
SELECT COUNT(*) FROM transactions;
