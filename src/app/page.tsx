
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ensureInitialAdmin } from "../lib/db";
import { getAppPath } from "@/src/lib/url";

export const dynamic = "force-dynamic";

async function Home() {
  // Ensure an initial admin user exists (idempotent)
  try { await ensureInitialAdmin(); } catch (e) { /* ignore */ }
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sessionToken")?.value;

  if (!sessionToken) {
    redirect(getAppPath("/login"));
  }

  redirect(getAppPath("/admin"));
}

export default Home;
