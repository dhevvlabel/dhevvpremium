
-- RUN THIS IN SUPABASE SQL EDITOR TO FIX STORAGE PERMISSIONS

-- Allow public to see banners
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'banners');

-- Allow anyone (admin panel) to upload/manage banners
-- Note: These are simplified for the app's current setup.
CREATE POLICY "Allow Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banners');
CREATE POLICY "Allow Update" ON storage.objects FOR UPDATE USING (bucket_id = 'banners');
CREATE POLICY "Allow Delete" ON storage.objects FOR DELETE USING (bucket_id = 'banners');
