"use client";

import { NextPage } from "next";
import Head from "next/head";

import Footer from "components/footer";

import Navigation from "components/nav";

import MECSFAQ from "components/mecs/mecsFaq";
import StaffStats from "components/mecs/staffStats";

function Main() {
  return (
    <>
      <Head>
        <title>MECS - Staff</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta property="og:title" content="MECS - Staff" />
        <meta property="og:site_name" content="MYX Labs" />
        <meta property="og:url" content="https://myx.yan.gg/mecs/staff" />
        <meta
          property="og:description"
          content="List and analysis of group membership staff. A MYX Labs donationware project."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://myx.yan.gg/img/mecs/og_image_v2.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MECS Staff by MYX Labs" />
        <meta
          name="twitter:description"
          content="List and analysis of group membership staff. A MYX Labs donationware project."
        />
        <meta
          name="twitter:image"
          content="https://myx.yan.gg/img/mecs/og_image_v2.png"
        />
      </Head>

      <main>
        <div className="flex flex-col h-screen">
          <Navigation />
          <div className="-mt-32 flex">
            <div className="max-w-7xl my-auto flex-grow mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6">
                <StaffStats />
              </div>
              <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6 mt-6">
                <MECSFAQ />
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </main>

      {/* Footer section */}
    </>
  );
}

const Home: NextPage = () => {
  return Main();
};

export default Home;
