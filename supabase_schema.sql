-- Create services table
CREATE TABLE public.services (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    description TEXT,
    subcategories JSONB DEFAULT '[]'::jsonb
);

-- Create doctors table
CREATE TABLE public.doctors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    specialty TEXT,
    phones JSONB DEFAULT '[]'::jsonb,
    phone TEXT,
    "whatsappIndex" INTEGER DEFAULT 0,
    image TEXT,
    address TEXT,
    location TEXT,
    facebook TEXT,
    schedule TEXT,
    fees TEXT,
    about TEXT,
    rating NUMERIC DEFAULT 0,
    reviews INTEGER DEFAULT 0,
    "serviceId" TEXT
);

-- Create places table
CREATE TABLE public.places (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    subcategory TEXT,
    image TEXT,
    phone TEXT,
    address TEXT,
    location TEXT,
    facebook TEXT,
    "workingHours" TEXT,
    about TEXT,
    rating NUMERIC DEFAULT 0,
    reviews INTEGER DEFAULT 0
);

-- Create ads table
CREATE TABLE public.ads (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image TEXT,
    link TEXT,
    "linkText" TEXT,
    "bgColor" TEXT,
    active BOOLEAN DEFAULT true
);

-- Disable Row Level Security (RLS) for testing, or set up policies
-- We will enable it but allow all for read, and authenticated for write

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access for services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Allow public read access for doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Allow public read access for places" ON public.places FOR SELECT USING (true);
CREATE POLICY "Allow public read access for ads" ON public.ads FOR SELECT USING (true);

-- Allow authenticated users to insert, update, delete
CREATE POLICY "Allow authenticated full access for services" ON public.services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access for doctors" ON public.doctors FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access for places" ON public.places FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow authenticated full access for ads" ON public.ads FOR ALL USING (auth.role() = 'authenticated');
