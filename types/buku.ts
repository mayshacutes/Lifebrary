export type Book = {
  id: string;
  isbn: string | null;
  title: string;
  author: string;
  publisher: string | null;
  publication_year: number | null;
  stock: number;
  description: string | null;
  created_at: string;
  updated_at: string;
};