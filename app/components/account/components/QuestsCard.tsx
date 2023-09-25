import { BountyCard } from "@/components";
import { BountyPreview, BountyState, User } from "@/types";
import { api } from "@/utils";
import { FC, useEffect, useState } from "react";

interface Props {
  user: User;
}

export const QuestsCard: FC<Props> = ({ user }) => {
  const [filteredBounties, setFilteredBounties] = useState<BountyPreview[]>();
  const {
    data: allBounties,
    isLoading: bountiesLoading,
    isError: bountiesError,
  } = api.bounties.getAllBounties.useQuery(
    {
      currentUserId: user.id,
      onlyMyBounties: false,
    },
    {
      enabled: !!user,
    }
  );

  useEffect(() => {
    const filteredBounties = allBounties?.filter(
      (bounty) =>
        bounty.state === BountyState.COMPLETE &&
        bounty.users.find((bountyUser) => bountyUser.userid === user.id) &&
        (!bounty.isPrivate || self)
    );
    setFilteredBounties(filteredBounties);
  }, [allBounties, user]);

  return (
    <div className="bg-white w-full border border-neutral200 rounded-md overflow-hidden p-5">
      <p className="title-text text-neutral600">Completed Quests</p>
      <div className="flex flex-col gap-2">
        {bountiesLoading && (
          <div className="w-full flex justify-center items-center py-5">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
          </div>
        )}
        {filteredBounties?.length > 0 && (
          <div className="flex items-center gap-4 mb-2">
            {filteredBounties.slice(0, 2).map((bounty, index) => {
              return <BountyCard key={index} bounty={bounty} />;
            })}
          </div>
        )}
        {!bountiesLoading &&
          !bountiesError &&
          filteredBounties?.length === 0 && (
            <div className="w-full text-center">No completed Quests yet!</div>
          )}
      </div>
    </div>
  );
};
