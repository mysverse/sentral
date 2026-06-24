import NavMenu from "./nav_menu";
import AuthControls from "./AuthControls";

export default function Navigation() {
  return <NavMenu avatar={<AuthControls />} />;
}
