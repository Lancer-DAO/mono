import { useState, useEffect } from "react";
import { api, getUniqueItems } from "@/src/utils";
import { useUserWallet } from "@/src/providers";
import { LoadingBar } from "@/components";
import {
  BountyPreview,
  BountyState,
  Filters,
  TABLE_BOUNTY_STATES,
  User,
} from "@/types";
import { AnimatePresence } from "framer-motion";
import { useBounty } from "@/src/providers/bountyProvider";
import { useIndustry } from "@/src/providers/industryProvider";
import { useMint } from "@/src/providers/mintProvider";
import { QuestFilters, QuestRow } from "./components";
import { QUESTS_PER_PAGE } from "@/src/constants";

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

interface Props {
  type: "profile" | "quests";
  user: User;
  allBounties: BountyPreview[];
}

const QuestTable: React.FC<Props> = ({ type, user, allBounties }) => {
  // state
  const [tags, setTags] = useState<string[]>([]);
  const [bounds, setPriceBounds] = useState<[number, number]>([5, 10000]);
  const [industriesFilter, setIndustriesFilter] = useState<string[]>([]);
  const [filteredBounties, setFilteredBounties] = useState<BountyPreview[]>();
  const [filters, setFilters] = useState<Filters>({
    tags: tags,
    states: TABLE_BOUNTY_STATES,
  });

  // api + context
  const { questsPage, setQuestsPage, maxPages } = useBounty();
  const { currentUser } = useUserWallet();
  const { allIndustries } = useIndustry();

  function snakeToTitleCase(snakeCaseStr: string) {
    return snakeCaseStr
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  useEffect(() => {
    if (!allBounties || !allIndustries) return;
    var filteredBounties = [];
    if (type === "profile") {
      filteredBounties = allBounties?.filter((bounty) => {
        // filter out test quests unless user is a Lancer dev
        if ((!currentUser || !currentUser.isLancerDev) && bounty.isTest) {
          return false;
        }
        // filter out quests that don't include the user
        if (
          !bounty.users.some((bountyUser) => bountyUser.userid === user?.id)
        ) {
          return false;
        }

        if (bounty.state !== BountyState.COMPLETE) {
          return false;
        }

        return true;
      });
    } else {
      filteredBounties = allBounties?.filter((bounty) => {
        if ((!currentUser || !currentUser.isLancerDev) && bounty.isTest) {
          return false;
        }

        const bountyTags: string[] = bounty.tags.map((tag) => tag.name) || [];
        const commonTags = bountyTags.filter((tag) =>
          filters.tags.includes(tag)
        );
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

        return true;
      });
    }
    setFilteredBounties(filteredBounties);
  }, [filters, allBounties, currentUser, type]);

  useEffect(() => {
    // Get the meta-info off all bounties that are used for filters. Specifically
    // - all tags for bounties
    // - all orgs posting bounties
    // - all payout mints
    // - upper and lower bounds of price

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
        ...filters,
        tags: allTags,
      });
    }
  }, [allBounties, allIndustries]);

  return (
    <div
      className={`${
        type === "quests" ? "border border-neutral200" : ""
      } w-full flex flex-col gap-5`}
    >
      <div className="w-full flex flex-col bg-white rounded-md gap-2">
        <AnimatePresence>
          {!!allBounties && type === "quests" && (
            <QuestFilters
              tags={tags}
              count={
                filteredBounties ? filteredBounties.length : allBounties.length
              }
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
                  <h2
                    className={`${
                      type === "profile" && "hidden"
                    } text-neutral600 text-sm mt-[5px]`}
                  >
                    {stateMap[state] || snakeToTitleCase(state)}
                  </h2>
                  {bountyGroups[state].map((bounty, index) => (
                    <QuestRow bounty={bounty} key={index} />
                  ))}
                </div>
              ));
            })()}
          {filteredBounties?.length === 0 && (
            <div className="w-full flex flex-col items-center justify-center gap-2">
              <p className="text-neutral600 text-sm mt-[5px]">
                No Quests Found!
              </p>
            </div>
          )}
          <div className="flex items-center justify-center gap-5">
            <button
              onClick={() => {
                setQuestsPage(questsPage - 1);
              }}
              className={`text-blue text-sm font-bold mt-4 disabled:opacity-60 disabled:cursor-not-allowed`}
              disabled={questsPage - 1 < 0}
            >
              Prev Page
            </button>
            <button
              onClick={() => {
                setQuestsPage(questsPage + 1);
              }}
              className={`text-blue text-sm font-bold mt-4 disabled:opacity-60 disabled:cursor-not-allowed`}
              disabled={questsPage + 1 > maxPages - 1}
            >
              Next Page
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestTable;
