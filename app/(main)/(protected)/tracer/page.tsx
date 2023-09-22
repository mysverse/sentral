import { NextPage } from "next";
import Head from "next/head";

import Footer from "components/footer";

import Navigation from "components/nav";
import MysverseStats from "components/bandarStats";
import { getServerSession } from "next-auth";
import { authOptions } from "app/api/auth/[...nextauth]/route";

export default async function Main() {
  const session = await getServerSession(authOptions);
  return (
    <>
      <Head>
        <title>GenTag</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta property="og:title" content="GenTag" />
        <meta property="og:site_name" content="MYX Labs" />
        <meta property="og:url" content="https://myx.yan.gg/gentag" />
        <meta
          property="og:description"
          content="Personalise a variety of MYS uniforms with custom nametags. A MYX Labs donationware project."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://myx.yan.gg/img/gentag/og_image_v2.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GenTag by MYX Labs" />
        <meta
          name="twitter:description"
          content="Personalise a variety of MYS uniforms with custom nametags. A MYX Labs donationware project."
        />
        <meta
          name="twitter:image"
          content="https://myx.yan.gg/img/gentag/og_image_v2.png"
        />
      </Head>
      <main>
        <div className="min-h-full">
          <Navigation />
          <main className="-mt-32">
            <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6 lg:px-8">
              {session?.user.id ? (
                <MysverseStats userId={session?.user.id} />
              ) : null}
            </div>
          </main>
        </div>
      </main>
      {/* Footer section */}
      <Footer />
    </>
  );
}
