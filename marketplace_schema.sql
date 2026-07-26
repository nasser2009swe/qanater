-- 1. إنشاء جدول الإعلانات (Marketplace Ads)
CREATE TABLE public.marketplace_ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC,
    advertiser_name TEXT NOT NULL,
    advertiser_phone TEXT NOT NULL,
    main_image TEXT,
    images_json JSONB DEFAULT '[]'::jsonb, -- لحفظ روابط صور إضافية
    video_url TEXT, -- رابط فيديو للمنتج
    status TEXT DEFAULT 'pending', -- 'pending' (في الانتظار), 'approved' (موافق عليه), 'rejected' (مرفوض)
    rating NUMERIC DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. تفعيل الحماية
ALTER TABLE public.marketplace_ads ENABLE ROW LEVEL SECURITY;

-- 3. الصلاحيات: يمكن للجميع القراءة، ولكن فقط الإعلانات الـ (approved)
CREATE POLICY "Allow public read approved ads" 
ON public.marketplace_ads FOR SELECT 
USING (status = 'approved');

-- 4. الصلاحيات: يمكن للجميع الإضافة (لكنها تكون pending افتراضياً)
CREATE POLICY "Allow public insert ads" 
ON public.marketplace_ads FOR INSERT 
WITH CHECK (true);

-- 5. الصلاحيات: الأدمن (الذي قام بتسجيل الدخول) يمكنه رؤية كل شيء وتعديل كل شيء
CREATE POLICY "Allow admin full access" 
ON public.marketplace_ads FOR ALL 
USING (auth.role() = 'authenticated');
