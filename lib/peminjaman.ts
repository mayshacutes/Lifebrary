import { supabaseServer } from "./supabase/server";
import type { Loan } from "@/types/peminjaman";

export async function getAllLoans(): Promise<Loan[]> {
  const { data, error } = await supabaseServer
    .from("loans")
    .select(`
      *,
      users (full_name, username),
      loan_details (
        quantity,
        books (title, author)
      ),
      returns (return_date, late_days, fine)
    `)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getLoanById(id: string): Promise<Loan | null> {
  const { data, error } = await supabaseServer
    .from("loans")
    .select(`
      *,
      users (full_name, username),
      loan_details (
        quantity,
        books (title, author)
      ),
      returns (return_date, late_days, fine)
    `)
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function getLoanStats() {
  const today = new Date().toISOString().split("T")[0];

  const { count: active } = await supabaseServer
    .from("loans")
    .select("*", { count: "exact", head: true })
    .eq("status", "borrowed");

  const { count: late } = await supabaseServer
    .from("loans")
    .select("*", { count: "exact", head: true })
    .eq("status", "borrowed")
    .lt("due_date", today);

  const { data: fineData } = await supabaseServer
    .from("returns")
    .select("fine");
  const totalFine = fineData?.reduce((acc, r) => acc + Number(r.fine), 0) ?? 0;

  const { count: returnedToday } = await supabaseServer
    .from("returns")
    .select("*", { count: "exact", head: true })
    .eq("return_date", today);

  return {
    active: active ?? 0,
    late: late ?? 0,
    totalFine,
    returnedToday: returnedToday ?? 0,
  };
}

export async function createLoan(userId: string, bookIds: string[], dueDate: string) {
  const { data: loan, error } = await supabaseServer
    .from("loans")
    .insert({ user_id: userId, due_date: dueDate, status: "borrowed" })
    .select()
    .single();
  if (error) throw new Error(error.message);

  const details = bookIds.map((bookId) => ({
    loan_id: loan.id,
    book_id: bookId,
    quantity: 1,
  }));
  const { error: detailError } = await supabaseServer.from("loan_details").insert(details);
  if (detailError) throw new Error(detailError.message);
}

export async function returnLoan(loanId: string, lateDays: number, fine: number) {
  const { error: returnError } = await supabaseServer.from("returns").insert({
    loan_id: loanId,
    return_date: new Date().toISOString().split("T")[0],
    late_days: lateDays,
    fine,
  });
  if (returnError) throw new Error(returnError.message);

  const { error: loanError } = await supabaseServer
    .from("loans")
    .update({ status: "returned" })
    .eq("id", loanId);
  if (loanError) throw new Error(loanError.message);
}