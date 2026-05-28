import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://kosegzlnuadieanwabao.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtvc2VnemxudWFkaWVhbndhYmFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5OTI2NjMsImV4cCI6MjA5NTU2ODY2M30.mOPnvAMG6A5Qz-9LCC7uJAKhraV1omiSF4B6MYIZiQU"
);
