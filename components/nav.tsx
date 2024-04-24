import { auth } from "auth";
import RobloxAvatarDisplay from "./RobloxAvatarDisplay";
import NavMenu from "./nav_menu";

export default async function Navigation() {
  const session = await auth();

  const avatar =
    session?.user.image && session?.user.name ? (
      <RobloxAvatarDisplay
        image={session.user.image}
        name={session.user.name}
      />
    ) : null;

  return <NavMenu avatar={avatar} />;
}
