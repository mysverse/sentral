import RobloxAvatarDisplay from "./RobloxAvatarDisplay";
import { getServerSession } from "next-auth";
import { authOptions } from "app/api/auth/[...nextauth]/authOptions";
import NavMenu from "./nav_menu";

export default async function Navigation() {
  const session = await getServerSession(authOptions);

  const avatar =
    session?.user.image && session?.user.name ? (
      <RobloxAvatarDisplay
        image={session.user.image}
        name={session.user.name}
      />
    ) : null;

  return <NavMenu avatar={avatar} />;
}
