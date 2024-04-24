import { redirect } from "next/navigation";
import LoginContent from "./loginContent";
import { auth } from "auth";

export default async function LoginPage() {
  const session = await auth();
  if (session) {
    return redirect("/");
  }
  return <LoginContent />;
}
