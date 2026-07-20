-- 1. Create the reviews table
CREATE TABLE public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    entity_id TEXT NOT NULL,
    entity_type TEXT NOT NULL, -- 'doctor' or 'place'
    user_name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone to read the reviews
CREATE POLICY "Allow public read access for reviews" 
ON public.reviews FOR SELECT USING (true);

-- 4. Allow anyone to add a new review (Public Insert)
CREATE POLICY "Allow public insert for reviews" 
ON public.reviews FOR INSERT WITH CHECK (true);

-- 5. Create a function to automatically calculate and update average rating
CREATE OR REPLACE FUNCTION update_average_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating NUMERIC;
  total_reviews INTEGER;
  target_entity_id TEXT;
  target_entity_type TEXT;
BEGIN
  -- Determine which row was affected (useful for INSERT/UPDATE vs DELETE)
  IF TG_OP = 'DELETE' THEN
    target_entity_id := OLD.entity_id;
    target_entity_type := OLD.entity_type;
  ELSE
    target_entity_id := NEW.entity_id;
    target_entity_type := NEW.entity_type;
  END IF;

  -- Calculate new average and total count
  SELECT COALESCE(AVG(rating), 0), COUNT(*)
  INTO avg_rating, total_reviews
  FROM public.reviews
  WHERE entity_id = target_entity_id AND entity_type = target_entity_type;

  -- Update the doctors or places table
  IF target_entity_type = 'doctor' THEN
    UPDATE public.doctors
    SET rating = ROUND(avg_rating, 1), reviews = total_reviews
    WHERE id = target_entity_id;
  ELSIF target_entity_type = 'place' THEN
    UPDATE public.places
    SET rating = ROUND(avg_rating, 1), reviews = total_reviews
    WHERE id = target_entity_id;
  END IF;

  RETURN NULL; -- AFTER triggers ignore the return value
END;
$$ LANGUAGE plpgsql;

-- 6. Attach the trigger to the reviews table
CREATE TRIGGER trigger_update_rating
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION update_average_rating();
