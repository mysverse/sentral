import SignInButton from "components/signIn";

import Image from "next/image";

import Logo from "public/img/MYSverse_Sentral_Logo.svg";
import FeatureImage from "public/img/bandar_feature_image.webp";

// import { getServerSession } from "next-auth";
// import { authOptions } from "app/api/auth/[...nextauth]/route";
// import { redirect } from "next/navigation";

export default async function LoginPage() {
  // const session = await getServerSession(authOptions);

  // if (session) {
  //   return redirect("/");
  // }

  return (
    <>
      <div className="flex min-h-full flex-1">
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div>
              <Logo className="h-20 w-auto fill-white" />
              <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-100">
                Welcome to Sentral (Beta)
              </h2>
              <p className="mt-3 text-sm leading-6 text-gray-200">
                The official companion web app for MYSverse and MYSverse Sim.
              </p>
              <p className="mt-3 text-sm leading-6 text-gray-200">
                This site uses the Roblox Open Cloud and OAuth 2.0 APIs for data
                fetching and authentication, which are still in beta.
              </p>
              <p className="mt-3 text-sm leading-6 text-gray-200">
                {"Don't have a Roblox account? "}
                <a
                  href="https://www.roblox.com/"
                  className="font-semibold text-gray-100 hover:text-gray-200 underline hover:no-underline"
                >
                  Sign up here!
                </a>
              </p>
            </div>

            <div className="mt-10">
              <div className="mt-10">
                <div className="mt-6 grid grid-cols-1 gap-4">
                  <SignInButton />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative hidden w-0 flex-1 lg:block">
          <Image
            className="absolute inset-0 h-full w-full object-cover"
            src={FeatureImage}
            alt=""
            width={200}
            height={200}
            priority={true}
          />
        </div>
      </div>
    </>
  );
}
