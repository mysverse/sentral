import { auth } from "auth";
// import RobloxAvatarDisplay from "./RobloxAvatarDisplay";
import NavMenu from "./nav_menu";
import { getGroupRoles } from "utils/sim";
import { UserButton } from "@clerk/nextjs";

export default async function Navigation() {
  const session = await auth();
  let sim = false;

  if (session) {
    const userId = parseInt(session.user.id!);
    if (userId) {
      const groups = await getGroupRoles(userId);
      if (groups) {
        sim = groups.length > 0;
      }
    }
  }

  // const avatar = session?.user.name ? (
  //   <RobloxAvatarDisplay image={session?.user.image} name={session.user.name} />
  // ) : null;

  return <NavMenu avatar={<UserButton />} sim={sim} />;
}
