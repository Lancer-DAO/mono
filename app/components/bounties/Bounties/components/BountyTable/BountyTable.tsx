import { useState, useEffect } from "react";
import Image from "next/image";
import { smallClickAnimation } from "@/src/constants";

import { getUniqueItems } from "@/src/utils";
import { useUserWallet } from "@/src/providers";
import { LoadingBar, BountyCard } from "@/components";
import { api } from "@/src/utils/api";
import { useRouter } from "next/router";
import { BountyFilters } from "./components";
import { IAsyncResult } from "@/types/common";
import {
  BountyPreview,
  Filters,
  Industry,
  TABLE_BOUNTY_STATES,
  TABLE_MY_BOUNTY_STATES,
} from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import { Mint } from "@prisma/client";
export const BOUNTY_USER_RELATIONSHIP = [
  "Creator",
  "Requested Submitter",
  "Approved Submitter",
  "Submitter",
  "None",
];

const BountyList: React.FC<{}> = () => {
  const { currentUser } = useUserWallet();
  const router = useRouter();
  const { mutateAsync: getBounties } =
    api.bounties.getAllBounties.useMutation();
  const { mutateAsync: getAllIndustries } =
    api.industries.getAllIndustries.useMutation();
  const { mutateAsync: getMintsAPI } = api.mints.getMints.useMutation();

  const [tags, setTags] = useState<string[]>([]);
  const [mints, setMints] = useState<IAsyncResult<Mint[]>>({
    isLoading: true,
  });
  // const [orgs, setOrgs] = useState<string[]>([]);
  const [bounds, setPriceBounds] = useState<[number, number]>([5, 10000]);
  const [bounties, setBounties] = useState<IAsyncResult<BountyPreview[]>>();
  const [industries, setIndustries] = useState<IAsyncResult<Industry[]>>({
    isLoading: true,
  });
  const [industriesFilter, setIndustriesFilter] = useState<string[]>([]);
  const [filteredBounties, setFilteredBounties] = useState<BountyPreview[]>();
  const [showFilters, setShowFilters] = useState<boolean>(true);
  const [filters, setFilters] = useState<Filters>({
    industries: industriesFilter,
    tags: tags,
    estimatedPriceBounds: bounds,
    states: TABLE_BOUNTY_STATES,
    relationships: BOUNTY_USER_RELATIONSHIP,
    isMyBounties: true,
  });

  useEffect(() => {
    const getBs = async () => {
      if (router.isReady && currentUser?.id) {
        setBounties({ isLoading: true });
        try {
          const bounties = await getBounties({
            currentUserId: currentUser.id,
            onlyMyBounties: filters.isMyBounties,
          });
          setBounties({ result: bounties, isLoading: false });
          // console.log("bounties!!: ", bounties);
        } catch (e) {
          console.log("error getting bounties: ", e);
          setBounties({ error: e, isLoading: false });
        }
      } else {
        setBounties({ isLoading: false });
        console.log("router not ready or no user");
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

    const fetchCurrentMints = async () => {
      try {
        const fetchedMints = await getMintsAPI();
        setMints({ result: fetchedMints, isLoading: false });
      } catch (e) {
        console.log("error getting mints: ", e);
        setMints({ error: e, isLoading: false });
      }
    };

    getBs();
    fetchCurrentIndustries();
    fetchCurrentMints();
  }, [router.isReady, currentUser?.id, filters.isMyBounties]);

  useEffect(() => {
    const filteredBounties = bounties?.result?.filter((bounty) => {
      if (!bounty.escrow.publicKey || !bounty.escrow.mint) {
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
      if (commonTags?.length === 0 && tags?.length !== 0) {
        return false;
      }

      if (!filters.states.includes(bounty.state)) {
        return false;
      }

      if (
        bounty.price &&
        (Number(bounty.price) < filters.estimatedPriceBounds[0] ||
          Number(bounty.price) > filters.estimatedPriceBounds[1])
      ) {
        return false;
      }

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

    if (!bounties?.result || !industries?.result) return;
    if (bounties && bounties?.result?.length !== 0) {
      const allTags = bounties?.result
        ?.map((bounty) => bounty.tags.map((tag) => tag.name))
        ?.reduce(
          (accumulator, currentValue) => [
            ...accumulator,
            ...(currentValue ? currentValue : []),
          ],
          []
        );
      const uniqueTags = getUniqueItems(allTags);
      const allIndustries = industries?.result.map((industry) => industry.name);

      setIndustriesFilter(allIndustries);

      setTags(uniqueTags);
      const allPrices = bounties?.result.map((bounty) =>
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
        industries: allIndustries,
        estimatedPriceBounds: priceBounds,
        states: filters.isMyBounties
          ? TABLE_MY_BOUNTY_STATES
          : TABLE_BOUNTY_STATES,
        relationships: BOUNTY_USER_RELATIONSHIP,
        isMyBounties: filters.isMyBounties,
      });
    }
  }, [bounties, industries]);

  return (
    <AnimatePresence>
      <div className="w-full flex items-start mt-5 gap-5 pb-10">
        {showFilters && bounties?.result?.length > 0 && (
          <BountyFilters
            mints={mints.result}
            industries={industries?.result}
            tags={tags}
            priceBounds={bounds}
            // orgs={orgs}
            filters={filters}
            setFilters={setFilters}
            setBounties={setBounties}
          />
        )}

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
          {bounties?.result?.length > 0 && (
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

          {bounties?.isLoading && (
            <div className="w-full flex flex-col items-center">
              <LoadingBar title="Loading Bounties" />
            </div>
          )}

          <div className={`w-full flex flex-wrap gap-5`}>
            {!bounties?.isLoading && filteredBounties?.length === 0 && (
              <p className="w-full text-center col-span-full">
                No matching bounties available!
              </p>
            )}
            {bounties?.error && (
              <p className="w-full text-center col-span-full">
                Error fetching bounties
              </p>
            )}
            {filteredBounties?.length > 0 &&
              filteredBounties?.map((bounty, index) => {
                return (
                  <BountyCard
                    bounty={bounty}
                    allIndustries={industries?.result}
                    key={index}
                  />
                );
              })}
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default BountyList;
