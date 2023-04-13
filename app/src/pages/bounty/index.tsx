import { useRouter } from "next/router";
import Bounty from "@/src/pages/bounty/bounty";
import { AllProviders } from "@/src/providers";
import { PageLayout } from "@/src/layouts";

function App() {
  return (
    <AllProviders>
      <PageLayout>
        <Bounty />
      </PageLayout>
    </AllProviders>
  );
}

export default App;
