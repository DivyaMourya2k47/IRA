/*
  # Add Required Firebase Indexes

  1. Index Details
    - Collection: cycles
    - Fields:
      - userId (ascending)
      - startDate (ascending)
      - __name__ (ascending)
*/

-- Create composite index for cycles collection
CREATE INDEX IF NOT EXISTS cycles_user_start_date_idx
ON cycles (userId ASC, startDate ASC);