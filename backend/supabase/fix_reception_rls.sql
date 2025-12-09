-- Allow receptionists to update visitors (checkout)
CREATE POLICY "Receptionists can update visitors"
ON visitors
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'reception'
  )
);

-- Allow receptionists to update badges (return/issue)
CREATE POLICY "Receptionists can update badges"
ON badges
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'reception'
  )
);

-- Check existing policies
SELECT * FROM pg_policies WHERE tablename = 'visitors' OR tablename = 'badges';
