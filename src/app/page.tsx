import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ensureInitialAdmin } from "../lib/db";

export const dynamic = "force-dynamic";

async function Home() {
  // Ensure an initial admin user exists (idempotent)
  try { await ensureInitialAdmin(); } catch (e) { /* ignore */ }
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sessionToken")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  redirect("/admin");
}

export default Home;
