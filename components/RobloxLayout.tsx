import { auth } from "auth";
import RobloxAccountRequired from "./robloxAccountRequired";

export default async function RobloxLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user.id) {
    return <>{children}</>;
  }
  return <RobloxAccountRequired />;
}
