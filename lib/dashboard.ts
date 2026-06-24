import { supabaseServer } from "./supabase/server";

export async function getAdminDashboardStats() {
  const today = new Date().toISOString().split("T")[0];

  const [
    { count: totalBooks },
    { count: totalMembers },
    { count: activeLoans },
    { count: lateLoans },
    { count: returnedToday },
    { count: borrowedToday },
    { count: newMembersToday },
    { data: fineData },
  ] = await Promise.all([
    supabaseServer.from("books").select("*", { count: "exact", head: true }),
    supabaseServer.from("users").select("*", { count: "exact", head: true }).eq("role", "anggota"),
    supabaseServer.from("loans").select("*", { count: "exact", head: true }).eq("status", "borrowed"),
    supabaseServer.from("loans").select("*", { count: "exact", head: true }).eq("status", "borrowed").lt("due_date", today),
    supabaseServer.from("returns").select("*", { count: "exact", head: true }).eq("return_date", today),
    supabaseServer.from("loans").select("*", { count: "exact", head: true }).eq("loan_date", today),
    supabaseServer.from("users").select("*", { count: "exact", head: true }).eq("role", "anggota").gte("created_at", today),
    supabaseServer.from("returns").select("fine"),
  ]);

  const totalFine = fineData?.reduce((acc, r) => acc + Number(r.fine), 0) ?? 0;

  return {
    totalBooks: totalBooks ?? 0,
    totalMembers: totalMembers ?? 0,
    activeLoans: activeLoans ?? 0,
    lateLoans: lateLoans ?? 0,
    returnedToday: returnedToday ?? 0,
    borrowedToday: borrowedToday ?? 0,
    newMembersToday: newMembersToday ?? 0,
    totalFine,
  };
}

export async function getRecentLoans() {
  const { data, error } = await supabaseServer
    .from("loans")
    .select(`
      *,
      users (full_name),
      loan_details (
        books (title)
      ),
      returns (fine)
    `)
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) return [];
  return data ?? [];
}

export async function getWeeklyLoanData() {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }

  const counts = await Promise.all(
    days.map(async (day) => {
      const { count } = await supabaseServer
        .from("loans")
        .select("*", { count: "exact", head: true })
        .eq("loan_date", day);
      return count ?? 0;
    })
  );

  return days.map((day, i) => ({
    day: ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"][new Date(day).getDay() === 0 ? 6 : new Date(day).getDay() - 1],
    count: counts[i],
  }));
}

export async function getDashboardData(userId: string) {
  const today = new Date().toISOString().split("T")[0];

  const [
    { count: totalBooks },
    { count: borrowedCount },
    { data: nearestDue },
    { data: books },
    { data: activeLoans },
  ] = await Promise.all([
    supabaseServer
      .from("books")
      .select("*", { count: "exact", head: true }),

    supabaseServer
      .from("loans")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("status", ["borrowed", "extended"]),

    supabaseServer
      .from("loans")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["borrowed", "extended"])
      .order("due_date", { ascending: true })
      .limit(1)
      .single(),

    supabaseServer
      .from("books")
      .select("*")
      .limit(6),

    supabaseServer
      .from("loans")
      .select("*")
      .eq("user_id", userId)
      .in("status", ["borrowed", "extended"])
      .order("loan_date", { ascending: false }),
  ]);

  return {
    totalBooks: totalBooks ?? 0,
    borrowedCount: borrowedCount ?? 0,
    nearestDue: nearestDue ?? null,
    books: books ?? [],
    activeLoans: activeLoans ?? [],
  };
}