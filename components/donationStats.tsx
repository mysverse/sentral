"use client";

import { JSX, useEffect, useState } from "react";
import Markdown from "react-markdown";
import { useOpenCollectiveMemberStats } from "./swr";

export default function DonationStats() {
  const { apiResponse } = useOpenCollectiveMemberStats(true);
  // const [index, setIndex] = useState(-1);
  const [donationText, setDonationText] = useState<JSX.Element>();

  useEffect(() => {
    if (apiResponse) {
      const validDonors = apiResponse.filter(
        (item) => item.totalAmountDonated > 0
      );
      const selectedIndex = Math.floor(Math.random() * validDonors.length);
      //   while (selectedIndex === index || index < 0) {
      //     selectedIndex = Math.floor(Math.random() * validDonors.length);
      //   }
      //   setIndex(selectedIndex);
      const donor = validDonors[selectedIndex];
      const amount = donor.totalAmountDonated;
      setDonationText(
        <Markdown>
          {`Thanks ${
            donor.name === "MYX Labs"
              ? "to members of the community"
              : `**${donor.name}**`
          } for contributing a total of **${amount.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })} ${donor.currency}**!`}
        </Markdown>
      );
    }
  }, [apiResponse]);

  if (!setDonationText) {
    // return <Spinner />;
    return null;
  }

  //   return (
  //     <Banner
  //       content={`Thanks ${
  //         donor.name
  //       } for donating ${donor.totalAmountDonated.toFixed(2)} ${
  //         donor.currency
  //       } to MYX Labs!`}
  //     />
  //   );
  return (
    <div className={donationText ? "visible" : "invisible"}>
      {donationText ?? "Loading..."}
    </div>
  );
}
