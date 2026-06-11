import { Button } from "components/catalyst/button";
import { Card } from "components/ui/card";

export default function NotFound() {
  return (
    <div className="bg-page flex grow items-center justify-center">
      <Card variant="elevated" className="p-6 text-center">
        <h1 className="text-strong mb-4 text-4xl font-bold">Page Not Found</h1>
        <p className="text-muted mb-6">
          Sorry, the page you are looking for does not exist in MYSverse
          Sentral.
        </p>
        <Button href="/">Go to Home</Button>
      </Card>
    </div>
  );
}
