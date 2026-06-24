// lib/anggota-session.ts
import { supabase } from "./supabase/client";
import type { User } from "@/types/anggota";

export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === "undefined") return null;
  const userId = localStorage.getItem("user_id");
  if (!userId) return null;
  const { data } = await supabase.from("users").select("*").eq("id", userId).single();
  return data ?? null;
}