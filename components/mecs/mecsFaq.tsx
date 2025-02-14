import FAQ from "components/FAQ";

const faqs = [
  {
    question: "What are the mandatory requirements?",
    answer:
      "Players must pass 3 mandatory criteria to be considered eligible for membership; account age, blacklist, and trust factor."
  },
  {
    question: "What does account age mean?",
    answer:
      "Account age is a measure of the duration since a player's account was created, and is typically measured in days. A mandatory membership requirement is to have an account older than 60 days*."
  },
  {
    question: "What types of blacklists are there?",
    answer:
      "There are two types of blacklists; individual and group blacklists. Individual blacklists are issued on a per-player basis, while group blacklists affect all players in a particular group."
  },
  {
    question:
      "Is it possible to be both individually and group blacklisted at the same time?",
    answer: `Yes. The MECS result will reflect this as "Multiple" under the blacklist section.`
  },
  {
    question: "What is the trust factor?",
    answer:
      "The trust factor system is a criteria-based scoring system that is used to determine a player's legitimacy based on several account characteristics, such as the amount of accessories owned."
  },
  {
    question: "Must all of the trust factor criteria be fulfilled to pass?",
    answer:
      "No. It is still possible to pass trust factor while failing any 1 of its criteria*. Passing score is 75% and above*."
  },
  {
    question: "What is DAR and MTBD?",
    answer:
      "DAR and MTBD are metrics used to gauge a membership staff's performance. DAR is short for Decision Accuracy Rate, a percentage that quantifies the decision-making accuracy of the individual. Higher DAR values are better. On the other hand, Mode Time Between Decisions (MTBD) measures the average time between decisions, typically measured in seconds and averaged with mode. A lower MTBD is better, however a higher DAR will always be prioritised."
  }
  // More questions...
];

export default function MECSFAQ() {
  return (
    <FAQ
      title="Common questions"
      faqs={faqs}
      footer={"As of 14 Feburary 2025"}
    />
  );
}
