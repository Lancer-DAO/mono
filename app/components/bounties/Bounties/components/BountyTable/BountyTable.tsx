import { useState, useEffect } from "react";
import {
  TABLE_BOUNTY_STATES,
  TABLE_MY_BOUNTY_STATES,
  smallClickAnimation,
} from "@/src/constants";
import { getUniqueItems } from "@/src/utils";
import { useUserWallet } from "@/src/providers";
import { LoadingBar, BountyCard, Button } from "@/components";
import { api } from "@/src/utils/api";
import { useRouter } from "next/router";
import { BountyFilters } from "./components";
import { IAsyncResult } from "@/types/common";
import { BountyPreview, Filters } from "@/types";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
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
  const [tags, setTags] = useState<string[]>([]);
  const [mints, setMints] = useState<string[]>([]);
  const [orgs, setOrgs] = useState<string[]>([]);
  const [bounds, setPriceBounds] = useState<[number, number]>([100, 10000]);
  const [bounties, setBounties] = useState<IAsyncResult<BountyPreview[]>>();
  const [filteredBounties, setFilteredBounties] = useState<BountyPreview[]>();
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<Filters>({
    mints: mints,
    tags: tags,
    orgs: orgs,
    estimatedPriceBounds: bounds,
    states: TABLE_BOUNTY_STATES,
    relationships: BOUNTY_USER_RELATIONSHIP,
    isMyBounties: false,
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
        } catch (e) {
          console.log("error getting bounties: ", e);
          setBounties({ error: e, isLoading: false });
        }
      }
    };
    getBs();
  }, [router.isReady, currentUser?.id, filters.isMyBounties]);

  useEffect(() => {
    const filteredBounties = bounties?.result?.filter((bounty) => {
      if (!bounty.escrow.publicKey || !bounty.escrow.mint) {
        return false;
      }
      if (!filters.mints.includes(bounty.escrow.mint.ticker)) {
        return false;
      }

      if (!filters.orgs.includes(bounty.repository?.organization)) {
        return false;
      }

      const bountyTags = bounty.tags || [];
      const commonTags = bountyTags.filter((tag) =>
        filters.tags.includes(tag.name)
      );
      if (commonTags.length === 0 && tags.length !== 0) {
        return false;
      }

      if (!filters.states.includes(bounty.state)) {
        return false;
      }
      const bountyEstimate = parseFloat(bounty.estimatedTime.toString());
      if (
        bountyEstimate < filters.estimatedPriceBounds[0] ||
        bountyEstimate > filters.estimatedPriceBounds[1]
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
    // - upper and lower bounds of estimated time completion

    if (!bounties?.result) return;
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
      const uniqueOrgs = getUniqueItems(
        bounties?.result.map((bounty) => bounty.repository?.organization) ?? []
      );
      const uniqueMints = getUniqueItems(
        bounties?.result.map((bounty) => bounty.escrow.mint.ticker) ?? []
      );
      setTags(uniqueTags);
      setOrgs(uniqueOrgs);
      setMints(uniqueMints);
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
        mints: uniqueMints,
        tags: allTags,
        orgs: uniqueOrgs,
        estimatedPriceBounds: priceBounds,
        states: filters.isMyBounties
          ? TABLE_MY_BOUNTY_STATES
          : TABLE_BOUNTY_STATES,
        relationships: BOUNTY_USER_RELATIONSHIP,
        isMyBounties: filters.isMyBounties,
      });
    }
  }, [bounties?.result]);

  return (
    <AnimatePresence>
      <div className="w-full flex items-start mt-5 gap-10">
        {showFilters && (
          <BountyFilters
            mints={mints}
            tags={tags}
            priceBounds={bounds}
            orgs={orgs}
            filters={filters}
            setFilters={setFilters}
            setBounties={setBounties}
          />
        )}

        <div className="w-full flex flex-col gap-5 px-10">
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

          {bounties?.isLoading && (
            <div className="w-full flex flex-col items-center">
              <LoadingBar title="Loading Bounties" />
            </div>
          )}

          <div
            className={`w-full grid ${
              !showFilters
                ? "lg:grid-cols-4 2xl:grid-cols-6"
                : "lg:grid-cols-3 2xl:grid-cols-5"
            } grid-cols-1 sm:grid-cols-2 gap-5`}
          >
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
                return <BountyCard bounty={bounty} key={index} />;
              })}
          </div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default BountyList;
