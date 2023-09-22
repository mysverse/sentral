"use client";

import { NextPage } from "next";
import Head from "next/head";

import Navigation from "components/nav";
import Footer from "components/footer";

import Markdown from "react-markdown";

const content = `
**MYX Labs** ("we", "us", or "our"), the developers and maintainers of this web application, take your privacy very seriously, and hence this privacy policy serves to inform you, the user, of the ways our application may affect you in that regard.

### What data we collect from you

While at present we do not collect any information from your browser activity on the web application itself (e.g. clicks, pages visited), we reserve the right to do so in the future.

We currently do not utilise server-side cookies, but we implement local browser storage to save certain settings (e.g. if a popup has been acknowledged).

The usage of our various products, such as MECS and GenTag may produce logs, which may include but is not limited to data that you specify in your request, such as:
- Your query input (e.g. the player name / user ID for MECS, nicknames for GenTag)
- Your IP address
- The date and time of your request

### How your data is collected and stored

Most logs never leave the server they are hosted on, but in certain cases, these logs may be shared with 3rd party services, such as Discord, which is secured by authenticating and limiting access to this data to authorised individuals only.

Since most of the APIs are open source on GitHub, you may review the source code to identify how exactly the data is being collected and processed.

### How your data is used

We use the collected data as metrics and as a form of abuse prevention.

Metrics such as the query data help us to identify trends and improvements we can make to our products, while data such as the IP address and date/time can be used to blacklist abusers to ensure a better user experience for legitimate visitors.

We do not share your data to any party for marketing purposes, and any 3rd party involved in the data collection process is strictly for logging purposes only.

### Enquiries

If you have any further questions about this privacy policy, please send an email to Lead Developer Yan at [myxlabs@yan.gg](mailto:myxlabs@yan.gg).
`;

function Main() {
  return (
    <>
      <Head>
        <title>Privacy Policy</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta property="og:title" content="Privacy Policy" />
        <meta property="og:site_name" content="MYX Labs" />
        <meta property="og:url" content="https://myx.yan.gg/app" />
        <meta
          property="og:description"
          content="Privacy policy of your to a selection of web services catered to the MYS community. A @yan3321 project."
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://myx.yan.gg/img/og_image_v2.png"
        />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MYX Labs Privacy Policy" />
        <meta
          name="twitter:description"
          content="Privacy policy of your gateway to a selection of web services catered to the MYS community. A @yan3321 project."
        />
        <meta
          name="twitter:image"
          content="https://myx.yan.gg/img/og_image_v2.png"
        />
      </Head>

      <main>
        <div className="flex flex-col h-screen">
          <Navigation />
          <div className="-mt-32 flex">
            <div className="max-w-2xl my-auto flex-grow mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6 mt-6">
                <div className="prose my-auto">
                  <Markdown>{content}</Markdown>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </main>
    </>
  );
}

const Home: NextPage = () => {
  return Main();
};

export default Home;
