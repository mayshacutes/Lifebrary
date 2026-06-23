export type User = {
  id: string;
  username: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  role: "admin" | "anggota";
  created_at: string;
};