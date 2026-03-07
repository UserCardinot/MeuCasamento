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
      <main className="min-h-screen px-6 sm:px-12 py-24 bg-[#FAFAFA] flex items-center justify-center">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </main>
    );
  }

  return <Dashboard />;
}
