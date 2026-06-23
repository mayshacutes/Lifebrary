export type Loan = {
  id: string;
  user_id: string;
  loan_date: string;
  due_date: string;
  status: "borrowed" | "returned" | "extended";
  created_at: string;
  users?: {
    full_name: string;
    username: string;
  };
  loan_details?: {
    quantity: number;
    books: {
      title: string;
      author: string;
    };
  }[];
  returns?: {
    return_date: string;
    late_days: number;
    fine: number;
  } | null;
};