-- Fix Arunachal Pradesh state code collision.
-- Kiren Rijiju (myneta_id=251) and Tapir Gao (myneta_id=257) have state_id
-- pointing to the AP row because deriveStateCode collided "Andhra Pradesh"
-- and "Arunachal Pradesh" onto the same code 'AP'.
--
-- Run with:
--   psql $SUPABASE_DB_URL -f db/migrations/0002_fix_state_codes.sql

BEGIN;

-- 1. Ensure Andhra Pradesh row has code AP and correct name.
UPDATE states SET name = 'Andhra Pradesh' WHERE code = 'AP';

-- 2. Insert Arunachal Pradesh with code AR (or fix name if row exists).
INSERT INTO states (name, code)
VALUES ('Arunachal Pradesh', 'AR')
ON CONFLICT (code) DO UPDATE SET name = 'Arunachal Pradesh';

-- 3. Move the two Arunachal MPs to state AR by myneta_id (authoritative).
UPDATE politicians
SET state_id = (SELECT id FROM states WHERE code = 'AR')
WHERE myneta_id IN (251, 257);

-- 4. Verify result — should show both MPs linked to AR / Arunachal Pradesh.
SELECT p.myneta_id, p.name, p.constituency, s.code AS state_code, s.name AS state_name
FROM politicians p
JOIN states s ON s.id = p.state_id
WHERE p.myneta_id IN (251, 257);

COMMIT;
