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
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-b from-stone-100/90 via-stone-50 to-white px-6 py-24 sm:px-12">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </main>
    );
  }

  return <Dashboard />;
}
