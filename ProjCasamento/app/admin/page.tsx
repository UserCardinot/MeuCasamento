import AdminGuard from "./AdminGuard";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return <AdminGuard />;
}
