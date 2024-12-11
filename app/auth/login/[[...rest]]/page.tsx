import { SignIn } from "@clerk/nextjs";

export default function LoginContent() {
  return (
    <SignIn
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
