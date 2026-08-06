export type AppRole = "applicant" | "admin" | "system_admin";

export type ExpenseApplicationType = "advance" | "after";

export type ExpenseStatus = "pending" | "approved" | "returned";

export type ExpenseEventType =
  | "submitted"
  | "resubmitted"
  | "approved"
  | "returned";

export type Profile = {
  id: string;
  login_id: string;
  display_name: string;
  role: AppRole;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
};

export type ExpenseCategory = {
  id: number;
  code: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

export type ExpenseApplication = {
  id: string;
  application_no: string;
  applicant_id: string;
  applicant_name_snapshot: string;
  application_type: ExpenseApplicationType;
  category_id: number;
  category_name_snapshot: string;
  amount: number;
  expense_date: string;
  description: string;
  after_reason: string | null;
  receipt_path: string | null;
  status: ExpenseStatus;
  admin_note: string | null;
  version: number;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ExpenseEvent = {
  id: number;
  application_id: string;
  event_type: ExpenseEventType;
  actor_id: string | null;
  from_status: ExpenseStatus | null;
  to_status: ExpenseStatus | null;
  note: string | null;
  created_at: string;
};
