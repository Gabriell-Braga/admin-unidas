import { redirect } from "next/navigation";
import { cookies } from "next/headers";

async function Home() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("sessionToken")?.value;

  if (!sessionToken) {
    redirect("/login");
  }

  redirect("/admin");
}

export default Home;
