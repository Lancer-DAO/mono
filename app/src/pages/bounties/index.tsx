import { BountyList } from "./bountyTable";
import { PageLayout } from "@/src/layouts";

const App: React.FC<{ isMyBounties?: boolean }> = ({ isMyBounties }) => {
  return (
    <PageLayout>
      <BountyList isMyBounties={isMyBounties} />
    </PageLayout>
  );
};

export default App;
