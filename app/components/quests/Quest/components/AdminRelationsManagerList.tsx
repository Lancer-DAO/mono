import { useBounty } from "@/src/providers/bountyProvider";
import { AdminRelationsManagerSection } from ".";

export type AdminRelationsManagerListType = "approved" | "requested";

export const AdminRelationsManagerList: React.FC = () => {
  const { currentBounty } = useBounty();
  return (
    <div className="flex flex-col flex-wrap gap-3 pt-4" id="bounty-actions">
      {currentBounty.all.map((user) => (
        <AdminRelationsManagerSection user={user} key={user.userid} />
      ))}
    </div>
  );
};
