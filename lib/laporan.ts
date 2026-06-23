import { supabaseServer } from "./supabase/server";

export async function getMonthlyLoanStats(year: number) {
  const months = Array.from({ length: 6 }, (_, i) => {
    const m = (i + 1).toString().padStart(2, "0");
    return { label: ["Jan","Feb","Mar","Apr","Mei","Jun"][i], from: `${year}-${m}-01`, to: `${year}-${m}-31` };
  });

  const counts = await Promise.all(
    months.map(async ({ from, to }) => {
      const { count } = await supabaseServer
        .from("loans")
        .select("*", { count: "exact", head: true })
        .gte("loan_date", from)
        .lte("loan_date", to);
      return count ?? 0;
    })
  );

  return months.map((m, i) => ({ label: m.label, count: counts[i] }));
}

export async function getTopBooks(month: number, year: number) {
  const from = `${year}-${month.toString().padStart(2, "0")}-01`;
  const to = `${year}-${month.toString().padStart(2, "0")}-31`;

  const { data } = await supabaseServer
    .from("loan_details")
    .select(`
      books (id, title, author),
      loans!inner (loan_date)
    `)
    .gte("loans.loan_date", from)
    .lte("loans.loan_date", to);

  const countMap: Record<string, { title: string; author: string; count: number }> = {};
  for (const row of data ?? []) {
    const book = Array.isArray(row.books) ? row.books[0] : row.books;
    if (!book) continue;
    if (!countMap[book.id]) countMap[book.id] = { title: book.title, author: book.author, count: 0 };
    countMap[book.id].count++;
  }

  const sorted = Object.values(countMap).sort((a, b) => b.count - a.count).slice(0, 5);
  const maxCount = sorted[0]?.count ?? 1;
  return sorted.map((b) => ({ ...b, pct: Math.round((b.count / maxCount) * 100) }));
}

export async function getLaporanStats(year: number) {
  const from = `${year}-01-01`;
  const to = `${year}-06-30`;

  const { count: totalLoans } = await supabaseServer
    .from("loans")
    .select("*", { count: "exact", head: true })
    .gte("loan_date", from)
    .lte("loan_date", to);

  const { data: fineData } = await supabaseServer
    .from("returns")
    .select("fine, created_at")
    .gte("created_at", from)
    .lte("created_at", to);

  const totalFine = fineData?.reduce((acc, r) => acc + Number(r.fine), 0) ?? 0;

  return {
    totalLoans: totalLoans ?? 0,
    avgPerMonth: totalLoans ? Math.round((totalLoans / 6) * 10) / 10 : 0,
    totalFine,
  };
}