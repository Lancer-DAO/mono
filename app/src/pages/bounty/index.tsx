import { useRouter } from "next/router";
import Bounty from "@/src/pages/bounty/bounty";
import { AllProviders } from "@/src/providers";
import { PageLayout } from "@/src/layouts";

function App() {
  return (
    <PageLayout>
      <Bounty />
    </PageLayout>
  );
}

export default App;
