import { authOptions } from "app/api/auth/[...nextauth]/authOptions";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import LoginContent from "./loginContent";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) {
    return redirect("/");
  }
  return <LoginContent />;
}
