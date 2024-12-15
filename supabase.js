import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://wscuuhtbbpioouajcjxp.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndzY3V1aHRiYnBpb291YWpjanhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1OTAyNDIsImV4cCI6MjA0ODE2NjI0Mn0.NFrDM231yKjZo9QsjsTC2cBe3cFyW1580CCw7vf2YRk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
