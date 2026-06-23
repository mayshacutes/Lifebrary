import { supabaseServer } from "./supabase/server";
import type { User } from "@/types/anggota";

export async function getAllAnggota(): Promise<User[]> {
  const { data, error } = await supabaseServer
    .from("users")
    .select("*")
    .eq("role", "anggota")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getAnggotaById(id: string): Promise<User | null> {
  const { data, error } = await supabaseServer
    .from("users")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createAnggota(user: Omit<User, "id" | "created_at"> & { password: string }) {
  const { error } = await supabaseServer.from("users").insert({ ...user, role: "anggota" });
  if (error) throw new Error(error.message);
}

export async function updateAnggota(id: string, user: Partial<User>) {
  const { error } = await supabaseServer.from("users").update(user).eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteAnggota(id: string) {
  const { error } = await supabaseServer.from("users").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getAnggotaStats() {
  const { count: total } = await supabaseServer
    .from("users")
    .select("*", { count: "exact", head: true })
    .eq("role", "anggota");

  const { count: withLate } = await supabaseServer
    .from("loans")
    .select("*", { count: "exact", head: true })
    .eq("status", "borrowed")
    .lt("due_date", new Date().toISOString().split("T")[0]);

  return {
    total: total ?? 0,
    withLate: withLate ?? 0,
  };
}