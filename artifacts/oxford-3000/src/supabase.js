import { createClient } from "@supabase/supabase-js";

// ดึงค่า URL และ Key ที่เราแอบเซฟไว้ในไฟล์ .env ออกมาใช้งาน
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// สร้างตัวแปรหลักสำหรับเรียกใช้งานคำสั่งต่าง ๆ
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
