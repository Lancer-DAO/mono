import { BountyCard } from "@/components";
import { BountyPreview, IAsyncResult, Industry } from "@/types/";
import { api } from "@/utils";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";

export const QuestsCard: FC = () => {
  const [bounties, setBounties] = useState<IAsyncResult<BountyPreview[]>>({
    isLoading: true,
  });
  const [industries, setIndustries] = useState<IAsyncResult<Industry[]>>();
  const router = useRouter();
  const { mutateAsync: getBounties } =
    api.bounties.getAllBounties.useMutation();
  const { mutateAsync: getCurrentUser } = api.users.currentUser.useMutation();
  const { mutateAsync: getAllIndustries } =
    api.industries.getAllIndustries.useMutation();

  useEffect(() => {
    const getBountiesAsync = async () => {
      setBounties({ isLoading: true });
      if (router.query.id === undefined) {
        try {
          const user = await getCurrentUser();
          const bounties = await getBounties({
            currentUserId: user.id,
            onlyMyBounties: true,
          });
          setBounties({
            result: bounties.slice(0, 2),
            isLoading: false,
          });
        } catch (e) {
          console.log("error getting user or bounties: ", e);
          setBounties({ error: e, isLoading: false });
        }
      } else {
        try {
          const bounties = await getBounties({
            currentUserId: parseInt(router.query.id as string),
            onlyMyBounties: false,
          });
          setBounties({
            result: bounties.slice(0, 2),
            isLoading: false,
          });
        } catch (e) {
          console.log("error getting bounties: ", e);
          setBounties({ error: e, isLoading: false });
        }
      }
    };

    const fetchCurrentIndustries = async () => {
      try {
        const industries = await getAllIndustries();
        setIndustries({ result: industries, isLoading: false });
      } catch (e) {
        console.log("error getting industries: ", e);
        setIndustries({ error: e, isLoading: false });
      }
    };

    fetchCurrentIndustries();
    getBountiesAsync();
  }, []);

  return (
    <div className="relative w-full md:w-[658px] rounded-xl bg-bgLancerSecondary/[8%] overflow-hidden p-6 pt-8 pb-10">
      <p className="font-bold text-2xl text-textGreen mb-2">Previous Quests</p>
      <div className="flex items-center justify-between gap-2">
        {bounties.isLoading && (
          <div className="w-full flex justify-center items-center py-5">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900" />
          </div>
        )}
        {bounties?.result?.length > 0 && (
          <div className="flex items-center gap-4 mb-2">
            {bounties?.result.map((bounty, index) => {
              return (
                <BountyCard
                  key={index}
                  bounty={bounty}
                  allIndustries={industries?.result}
                />
              );
            })}
          </div>
        )}
        {!bounties.isLoading &&
          !bounties.error &&
          bounties.result.length === 0 && (
            <div className="w-full text-center">No bounties yet!</div>
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
