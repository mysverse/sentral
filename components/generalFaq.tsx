"use client";

import FAQ from "components/FAQ";

const faqs = [
  {
    question: "What is Sentral?",
    answer: `MYSverse Sentral, or just Sentral, is the official hub and companion app for MYSverse, serving game statistics, analytics tools, and a lot more to come!`
  },
  {
    question: "This looks familiar, is Sentral related to MYX Labs?",
    answer: `Since the developer of MYX Labs joined the MYSverse project, most of its current architecture has been shared. However, there have been a lot of backend changes to accomodate the new Roblox authentication flow, and a new, more efficient application UI will be introduced in due time.`
  },
  {
    question: "Who's behind this project?",
    answer: (
      <>
        Sentral is developed by{" "}
        <a
          href="https://twitter.com/yan3321"
          className="text-blue-700 underline hover:no-underline"
        >
          {" "}
          @yan3321
        </a>{" "}
        (aka. Yan), co-founder of MYSverse who also leads engineering, design,
        and content initiatives.
      </>
    )
  },
  {
    question: "How do I reach out for reports and enquiries?",
    answer: (
      <>
        For everything regarding MYSverse web infrastructure, contact Yan at{" "}
        <a
          href="mailto:yan@mysver.se"
          className="text-blue-700 underline hover:no-underline"
        >
          yan@mysver.se
        </a>
        . A reply (if applicable) will typically be sent within a week.
      </>
    )
  },
  {
    question:
      "What about open-source commitments? I'd like to look at the code.",
    answer: (
      <>
        The open-source strategy for MYSverse is still being finalised, but many
        features from MYX Labs are available on their{" "}
        <a
          href="https://github.com/myx-labs"
          className="text-blue-700 underline hover:no-underline"
        >
          GitHub
        </a>
        .
      </>
    )
  }
];

export default function GeneralFAQ() {
  return <FAQ title="About MYSverse Sentral" faqs={faqs} />;
}
