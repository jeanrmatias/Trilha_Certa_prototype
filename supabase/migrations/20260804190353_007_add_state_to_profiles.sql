/*
# Add State and City to Profiles

1. Modified Tables
  - `profiles`
    - `state` (text, nullable) — Brazilian state abbreviation (e.g. "SP", "RJ")
    - `city` (text, nullable) — City name (e.g. "São Paulo")

2. Security
  - No changes to existing RLS policies. Users can still only read/update their own profile.
  - The new columns inherit existing column-level privileges from the profiles table.

3. Important Notes
  - Both columns are nullable so existing profiles are not broken.
  - The state is stored as a 2-letter abbreviation (UF) for easy filtering.
  - The city is stored as free text.
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS state text DEFAULT '',
  ADD COLUMN IF NOT EXISTS city text DEFAULT '';
