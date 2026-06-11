import PageTransition from "components/ui/page-transition";
import VerifyACertificate from "components/VerifyACertificate";
import Logo from "public/img/MYSverse_Sentral_Logo.svg";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <PageTransition>
      <div className="mb-6 flex flex-col items-center gap-y-6 md:mb-16">
        <Logo className="h-16 w-auto fill-white md:h-18" />
        {children}
        <div>
          <VerifyACertificate />
        </div>
      </div>
    </PageTransition>
  );
}
