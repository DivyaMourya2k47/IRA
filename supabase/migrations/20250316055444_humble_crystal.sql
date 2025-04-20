/*
  # Create Firestore Indexes

  1. Index Details
    - Collection: cycles
    - Fields:
      - userId (ascending)
      - startDate (ascending)
      - __name__ (ascending)

  2. Index Details
    - Collection: bmiRecords
    - Fields:
      - userId (ascending)
      - date (ascending)
      - __name__ (ascending)

  3. Index Details
    - Collection: products
    - Fields:
      - inStock (ascending)
      - name (ascending)
      - __name__ (ascending)
*/

-- Create composite index for cycles collection
CREATE INDEX IF NOT EXISTS cycles_user_start_date_idx
ON cycles (userId ASC, startDate ASC);

-- Create composite index for bmiRecords collection
CREATE INDEX IF NOT EXISTS bmi_records_user_date_idx
ON bmiRecords (userId ASC, date ASC);

-- Create composite index for products collection
CREATE INDEX IF NOT EXISTS products_instock_name_idx
ON products (inStock ASC, name ASC);