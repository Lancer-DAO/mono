import { BountyList } from "./bountyTable";
import { PageLayout } from "@/src/layouts";
import { LancerProvider } from "@/src/providers";

const App: React.FC<{ isMyBounties?: boolean }> = ({ isMyBounties }) => {
  return (
    <LancerProvider>
      <PageLayout>
        <BountyList isMyBounties={isMyBounties} />
      </PageLayout>
    </LancerProvider>
  );
};

export default App;
