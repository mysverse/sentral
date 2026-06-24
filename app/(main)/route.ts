import { auth } from "auth";
import { redirect } from "next/navigation";

export async function GET() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }
  redirect("/auth/login");
}
