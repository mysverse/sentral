import { SignUp } from "@clerk/nextjs";

export default function LoginContent() {
  return (
    <SignUp
      appearance={{
        layout: {
          logoPlacement: "none",
          termsPageUrl: "/terms-of-service",
          privacyPageUrl: "/privacy-policy"
        },
        variables: { colorPrimary: "rgb(59, 130, 246)" }
      }}
    />
  );
}
