import { useRouter } from "next/router";
import Bounty from "@/src/pages/bounty/bounty";
import { AllProviders } from "@/src/providers";
import { DefaultLayout } from "@/src/components/templates/DefaultLayout";

function App() {
  return (
    <DefaultLayout>
      <Bounty />
    </DefaultLayout>
  );
}

export default App;
