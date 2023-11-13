import { getServerSession } from "next-auth/next";
import { authOptions } from "app/api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function ProtectedLayout({ children }: PropsWithChildren) {
  const session = await getServerSession(authOptions);
  if (session == null) {
    return redirect("/auth/login");
  } else {
    return <>{children}</>;
  }
}
