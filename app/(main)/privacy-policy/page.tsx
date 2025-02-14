import DefaultTransitionLayout from "components/transition";
import Markdown from "react-markdown";

const content = `
**MYSverse** ("we", "us", or "our"), the developers and maintainers of this web application "Sentral", take your privacy very seriously, and hence this privacy policy serves to inform you, the user, of the ways our application may affect you in that regard.

### What data we collect from you

We use Plausible web analytics to collect anonymised data about your visit, such as pages visited.

We use cookies for authentication purposes, and we implement local browser storage to save certain settings (e.g. if a popup has been acknowledged).

The usage of our various products, such as MECS and GenTag may produce logs, which may include but is not limited to data that you specify in your request, such as:
- Your query input (e.g. the player name / user ID for MECS, nicknames for GenTag)
- Your IP address
- The date and time of your request

### How your data is collected and stored

Most logs never leave the server they are hosted on, but in certain cases, these logs may be shared with 3rd party services, such as Plausible, which is secured by authenticating and limiting access to this data to authorised individuals only.

Since most of the APIs are open source on GitHub, you may review the source code to identify how exactly the data is being collected and processed.

### How your data is used

We use the collected data as metrics and as a form of abuse prevention.

Web analytics help us identify specific areas of improvement.

Metrics such as the query data help us to identify trends and improvements we can make to our products, while data such as the IP address and date/time can be used to blacklist abusers to ensure a better user experience for legitimate visitors.

We do not share your data to any party for marketing purposes, and any 3rd party involved in the data collection process is strictly for logging purposes only.

### Enquiries

If you have any further questions about this privacy policy, please send an email to Lead Developer Yan at [yan@mysver.se](mailto:yan@mysver.se).
`;

export default function PrivacyPolicyPage() {
  return (
    <DefaultTransitionLayout show={true} appear={true}>
      <div className="mx-auto my-auto max-w-5xl grow px-4 sm:px-6 lg:px-8">
        <div className="mt-6 rounded-lg bg-white px-5 py-6 shadow-sm sm:px-6">
          <div className="prose max-w-fit text-justify">
            <Markdown>{content}</Markdown>
          </div>
        </div>
      </div>
    </DefaultTransitionLayout>
  );
}
