"use client";

import { motion } from "motion/react";
// import { usePathname } from "next/navigation";
// import { useEffect, useState } from "react";
import Link from "next/link";
import SentralLogo from "public/img/MYSverse_Sentral_Logo.svg";

export default function Template({ children }: { children: React.ReactNode }) {
  // const pathname = usePathname();
  // const searchParams = useSearchParams();
  // const code = searchParams.get("code");
  // const [key, setKey] = useState(0);

  // useEffect(() => {
  //   setKey((prevKey) => prevKey + 1);
  // }, [pathname]);

  return (
    <motion.div
      // key={key}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ease: "easeOut", duration: 1 }}
    >
      <div className="mx-4 flex grow flex-col items-center gap-2 rounded-lg bg-white px-5 py-6 text-center shadow-lg sm:min-w-96 sm:grow-0 sm:gap-4 sm:px-8">
        <Link
          href={"/"}
          className="transition hover:opacity-80"
          passHref={true}
        >
          <SentralLogo
            height={43}
            width={128}
            alt="MYSverse Sentral Logo"
            className="fill-blue-600"
          />
        </Link>
        {children}
      </div>
    </motion.div>
  );
}
