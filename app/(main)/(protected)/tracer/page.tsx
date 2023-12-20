import MysverseStats from "components/bandarStats";
import { getServerSession } from "next-auth";
import { authOptions } from "app/api/auth/[...nextauth]/authOptions";
import LebuhrayaLeaderboard from "./components/LebuhrayaLeaderboard";

export default async function Main() {
  const session = await getServerSession(authOptions);
  // const testId = 31585182;
  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      <LebuhrayaLeaderboard />
      <div className="mt-8">
        {session?.user.id ? <MysverseStats userId={session.user.id} /> : null}
      </div>
    </div>
  );
}
