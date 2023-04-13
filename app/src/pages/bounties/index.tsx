import { BountyList } from "./bountyTable";
import { PageLayout } from "@/src/layouts";
import { AllProviders } from "@/src/providers";

const App: React.FC<{ isMyBounties?: boolean }> = ({ isMyBounties }) => {
  return (
    <AllProviders>
      <PageLayout>
        <BountyList isMyBounties={isMyBounties} />
      </PageLayout>
    </AllProviders>
  );
};

export default App;
