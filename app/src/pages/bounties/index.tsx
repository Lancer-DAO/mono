import { BountyList } from "./bountyTable";
import { DefaultLayout } from "@/src/components/templates/DefaultLayout";

const App: React.FC<{ isMyBounties?: boolean }> = ({ isMyBounties }) => {
  return (
    <DefaultLayout>
      <BountyList isMyBounties={isMyBounties} />
    </DefaultLayout>
  );
};

export default App;
