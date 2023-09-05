import { BountyCard } from "@/components";
import { useUserWallet } from "@/src/providers";
import { BountyPreview, BountyState } from "@/types";
import { api } from "@/utils";
import { FC, useEffect, useState } from "react";

export const QuestsCard: FC = () => {
  const [filteredBounties, setFilteredBounties] = useState<BountyPreview[]>();
  const { currentUser } = useUserWallet();
  const {
    data: allBounties,
    isLoading: bountiesLoading,
    isError: bountiesError,
  } = api.bounties.getAllBounties.useQuery(
    {
      currentUserId: currentUser.id,
      onlyMyBounties: true,
    },
    {
      enabled: !!currentUser,
    }
  );

  useEffect(() => {
    const filteredBounties = allBounties?.filter(
      (bounty) => bounty.state === BountyState.COMPLETE
    );
    setFilteredBounties(filteredBounties);
  }, [allBounties]);

  return (
    <div className="relative w-full md:w-[658px] rounded-xl bg-bgLancerSecondary/[8%] overflow-hidden p-6 pt-8 pb-10">
      <p className="font-bold text-2xl text-textGreen mb-2">Completed Quests</p>
      <div className="flex items-center justify-between gap-2">
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
        {/* <div className="absolute right-3 top-1/2 transform -translate-y-1/2 p-3">
          <motion.button {...midClickAnimation}>
            <NextArrow />
          </motion.button>
        </div> */}
      </div>
    </div>
  );
};
