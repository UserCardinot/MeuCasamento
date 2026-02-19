import { cookies } from "next/headers";
import { validateAdminSessionToken } from "@/lib/auth";
import LoginForm from "./LoginForm";
import Dashboard from "./Dashboard";

export default async function AdminGuard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  const isAuthenticated = token ? validateAdminSessionToken(token) : false;

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen p-8 bg-gradient-to-b from-casamento-creme to-casamento-sage flex items-center justify-center">
        <LoginForm />
      </main>
    );
  }

  return <Dashboard />;
}
