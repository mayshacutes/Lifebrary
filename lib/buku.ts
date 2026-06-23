import { supabaseServer } from "./supabase/server";
import type { Book } from "@/types/buku";

export async function getAllBooks(): Promise<Book[]> {
  const { data, error } = await supabaseServer
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getBookById(id: string): Promise<Book | null> {
  const { data, error } = await supabaseServer
    .from("books")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function createBook(book: Omit<Book, "id" | "created_at" | "updated_at">) {
  const { error } = await supabaseServer.from("books").insert(book);
  if (error) throw new Error(error.message);
}

export async function updateBook(id: string, book: Partial<Book>) {
  const { error } = await supabaseServer
    .from("books")
    .update({ ...book, updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteBook(id: string) {
  const { error } = await supabaseServer.from("books").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function getBookStats() {
  const { data: books } = await supabaseServer.from("books").select("stock");
  const total = books?.length ?? 0;
  const totalStock = books?.reduce((acc, b) => acc + b.stock, 0) ?? 0;

  const { count: borrowed } = await supabaseServer
    .from("loans")
    .select("*", { count: "exact", head: true })
    .eq("status", "borrowed");

  return {
    total,
    available: totalStock,
    borrowed: borrowed ?? 0,
  };
}