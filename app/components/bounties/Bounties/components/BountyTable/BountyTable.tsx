import { useState, useEffect } from "react";
import Image from "next/image";
import { smallClickAnimation } from "@/src/constants";
import { getUniqueItems } from "@/src/utils";
import { useUserWallet } from "@/src/providers";
import { LoadingBar, BountyCard } from "@/components";
import { api } from "@/src/utils/api";
import { BountyFilters } from "./components";
import { BountyPreview, Filters, TABLE_BOUNTY_STATES } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { useBounty } from "@/src/providers/bountyProvider";
import { useIndustry } from "@/src/providers/industryProvider";
import { useMint } from "@/src/providers/mintProvider";

export const BOUNTY_USER_RELATIONSHIP = [
  "Creator",
  "Requested Submitter",
  "Approved Submitter",
  "Submitter",
  "None",
];

const BountyList: React.FC<{}> = () => {
  const { allBounties } = useBounty();
  // state
  const [tags, setTags] = useState<string[]>([]);
  const [bounds, setPriceBounds] = useState<[number, number]>([5, 10000]);
  const [industriesFilter, setIndustriesFilter] = useState<string[]>([]);
  const [filteredBounties, setFilteredBounties] = useState<BountyPreview[]>();
  const [showFilters, setShowFilters] = useState<boolean>(true);
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

  useEffect(() => {
    console.log("allBounties", allBounties);
    const filteredBounties = allBounties?.filter((bounty) => {
      if (!currentUser.isLancerDev && bounty.isTest) {
        return false;
      }
      /*
      if (!bounty.escrow.publicKey || !bounty.escrow.mint) {
        return false;
      }
      */
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
  }, [filters]);

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
    <div className="w-full flex items-start mt-5 gap-5 py-24">
      <AnimatePresence>
        {showFilters && !!allBounties && (
          <BountyFilters
            mints={allMints}
            industries={allIndustries}
            tags={tags}
            priceBounds={bounds}
            filters={filters}
            setFilters={setFilters}
          />
        )}
      </AnimatePresence>

      <div className="w-full flex flex-col gap-5 px-20">
        <div className="flex items-center gap-2">
          <Image
            src="/assets/icons/IndustryTrio.png"
            width={50}
            height={50}
            alt="industry trio icon"
          />
          <h1>Quests.</h1>
        </div>
        {/* filter button */}
        {allBounties?.length > 0 && (
          <motion.button
            className="w-[85px] h-[40px] flex items-center justify-center border-2
              bg-primaryBtn border-primaryBtnBorder rounded-xl font-bold text-xs"
            {...smallClickAnimation}
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18px"
                viewBox="0 0 512 512"
                className="fill-textPrimary"
              >
                <path d="M3.9 54.9C10.5 40.9 24.5 32 40 32H472c15.5 0 29.5 8.9 36.1 22.9s4.6 30.5-5.2 42.5L320 320.9V448c0 12.1-6.8 23.2-17.7 28.6s-23.8 4.3-33.5-3l-64-48c-8.1-6-12.8-15.5-12.8-25.6V320.9L9 97.3C-.7 85.4-2.8 68.8 3.9 54.9z" />
              </svg>
              <p className="text-xs">Filters</p>
            </div>
          </motion.button>
        )}

        {!allBounties && (
          <div className="w-full flex flex-col items-center">
            <LoadingBar title="Loading Quests" />
          </div>
        )}
        <div className={`w-full flex flex-wrap gap-5`}>
          {filteredBounties?.length > 0 &&
            filteredBounties?.map((bounty, index) => {
              return <BountyCard bounty={bounty} key={index} />;
            })}
        </div>
      </div>
    </div>
  );
};

export default BountyList;
