import { useState, useEffect } from "react";
import { getUniqueItems } from "@/src/utils";
import { useUserWallet } from "@/src/providers";
import { LoadingBar } from "@/components";
import { BountyPreview, Filters, TABLE_BOUNTY_STATES } from "@/types";
import { AnimatePresence } from "framer-motion";
import { useBounty } from "@/src/providers/bountyProvider";
import { useIndustry } from "@/src/providers/industryProvider";
import { useMint } from "@/src/providers/mintProvider";
import { QuestFilters, QuestRow } from "./components";

export const BOUNTY_USER_RELATIONSHIP = [
  "Creator",
  "Requested Submitter",
  "Approved Submitter",
  "Submitter",
  "None",
];

const stateMap = {
  complete: "Complete",
  voting_to_cancel: "Voting to Cancel",
  new: "New",
  canceled: "Canceled",
};

const QuestTable: React.FC<{}> = () => {
  const { allBounties } = useBounty();
  // state
  const [tags, setTags] = useState<string[]>([]);
  const [bounds, setPriceBounds] = useState<[number, number]>([5, 10000]);
  const [industriesFilter, setIndustriesFilter] = useState<string[]>([]);
  const [filteredBounties, setFilteredBounties] = useState<BountyPreview[]>();
  const [filters, setFilters] = useState<Filters>({
    industries: industriesFilter,
    tags: tags,
    estimatedPriceBounds: bounds,
    states: TABLE_BOUNTY_STATES,
    relationships: BOUNTY_USER_RELATIONSHIP,
    isMyBounties: false,
  });

  // api + context
  const { currentUser } = useUserWallet();
  const { allIndustries } = useIndustry();
  const { allMints } = useMint();

  function snakeToTitleCase(snakeCaseStr: string) {
    return snakeCaseStr
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  useEffect(() => {
    const filteredBounties = allBounties?.filter((bounty) => {
      if ((!currentUser || !currentUser.isLancerDev) && bounty.isTest) {
        return false;
      }
      if (!bounty.escrow.publicKey || !bounty.escrow.mint) {
        return false;
      }
      if (
        filters.isMyBounties &&
        !bounty.users.some((user) => user.userid === currentUser?.id)
      ) {
        return false;
      }

      // check if any of the bounty's industries is
      // included in the filters.industries list
      if (
        !bounty.industries.some((industry) =>
          filters.industries.includes(industry.name)
        )
      ) {
        return false;
      }

      const bountyTags: string[] = bounty.tags.map((tag) => tag.name) || [];
      const commonTags = bountyTags.filter((tag) => filters.tags.includes(tag));
      if (
        bountyTags.length !== 0 &&
        commonTags?.length === 0 &&
        tags?.length !== 0
      ) {
        return false;
      }

      if (!filters.states.includes(bounty.state)) {
        return false;
      }

      // if (
      //   bounty.price &&
      //   (Number(bounty.price) < filters.estimatedPriceBounds[0] ||
      //     Number(bounty.price) > filters.estimatedPriceBounds[1])
      // ) {
      //   return false;
      // }

      return true;
    });
    setFilteredBounties(filteredBounties);
  }, [filters, allBounties, currentUser]);

  useEffect(() => {
    // Get the meta-info off all bounties that are used for filters. Specifically
    // - all tags for bounties
    // - all orgs posting bounties
    // - all payout mints
    // - upper and lower bounds of price

    if (!allBounties || !allIndustries) return;
    if (allBounties && allBounties?.length !== 0) {
      const allTags = allBounties
        ?.map((bounty) => bounty.tags.map((tag) => tag.name))
        ?.reduce(
          (accumulator, currentValue) => [
            ...accumulator,
            ...(currentValue ? currentValue : []),
          ],
          []
        );
      const uniqueTags = getUniqueItems(allTags);
      const mappedInds = allIndustries.map((industry) => industry.name);

      setIndustriesFilter(mappedInds);

      setTags(uniqueTags);
      const allPrices = allBounties.map((bounty) =>
        bounty.price ? parseFloat(bounty.price.toString()) : 0
      );
      const maxPrice = Math.max(...allPrices) || 10;
      const minPrice = Math.min(...allPrices) || 0;
      const priceBounds: [number, number] = [
        minPrice,
        maxPrice === minPrice ? maxPrice + 1 : maxPrice,
      ];
      setPriceBounds(priceBounds);
      setFilters({
        tags: allTags,
        industries: mappedInds,
        estimatedPriceBounds: priceBounds,
        states: TABLE_BOUNTY_STATES,
        relationships: BOUNTY_USER_RELATIONSHIP,
        isMyBounties: filters.isMyBounties,
      });
    }
  }, [allBounties, allIndustries]);

  return (
    <div className="w-full flex flex-col gap-5 border border-neutral200">
      {!allBounties && (
        <div className="w-full flex flex-col items-center">
          <LoadingBar title="Loading Quests" />
        </div>
      )}
      <div className="w-full flex flex-col bg-white rounded-md gap-2">
        <AnimatePresence>
          {!!allBounties && (
            <QuestFilters
              mints={allMints}
              industries={allIndustries}
              tags={tags}
              count={
                filteredBounties ? filteredBounties.length : allBounties.length
              }
              priceBounds={bounds}
              filters={filters}
              setFilters={setFilters}
            />
          )}
        </AnimatePresence>

        <div className="w-full flex flex-col bg-white rounded-md py-4 px-6">
          {filteredBounties?.length > 0 &&
            (() => {
              // Create an object to store bounties grouped by state
              const bountyGroups = {};

              // Group bounties by state
              filteredBounties.forEach((bounty) => {
                const state = bounty.state;
                if (!bountyGroups[state]) {
                  bountyGroups[state] = [];
                }
                bountyGroups[state].push(bounty);
              });

              // Iterate through the groups and render headers and bounties
              return Object.keys(bountyGroups).map((state) => (
                <div key={state}>
                  <h2 className="text-black text-sm mt-[5px]">
                    {stateMap[state] || snakeToTitleCase(state)}
                  </h2>
                  {bountyGroups[state].map((bounty, index) => (
                    <QuestRow bounty={bounty} key={index} />
                  ))}
                </div>
              ));
            })()}
        </div>
      </div>
    </div>
  );
};

export default QuestTable;
