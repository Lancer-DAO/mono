import { useRouter } from "next/router";
import Bounty from "@/src/pages/bounty/bounty";
import { LancerProvider } from "@/src/providers/lancerProvider";
import { PageLayout } from "@/src/layouts";

function App() {
  return (
    <LancerProvider>
      <PageLayout>
        <Bounty />
      </PageLayout>
    </LancerProvider>
  );
}

export default App;
