import { TABLE_BOUNTY_STATES } from "@/src/constants";
import { getUniqueItems } from "@/src/utils";
import { useState } from "react";
import { useUserWallet } from "@/src/providers";
import { useEffect } from "react";
import { LoadingBar } from "@/components";
import { api } from "@/src/utils/api";
import { useRouter } from "next/router";
import BountyFilters from "./components/BountyFilters";
import LancerBounty from "./components/LancerBounty";
import { IAsyncResult } from "@/types/common";
export const BOUNTY_USER_RELATIONSHIP = [
  "Creator",
  "Requested Submitter",
  "Approved Submitter",
  "Submitter",
  "None",
];

export type Filters = {
  mints: string[];
  orgs: string[];
  tags: string[];
  states: string[];
  estimatedTimeBounds: [number, number];
  relationships: string[];
  isMyBounties: boolean;
};

const BountyList: React.FC<{}> = () => {
  const { currentUser } = useUserWallet();
  const router = useRouter();
  const { mutateAsync: getBounties } =
    api.bounties.getAllBounties.useMutation();
  const [tags, setTags] = useState<string[]>([]);
  const [mints, setMints] = useState<string[]>([]);
  const [orgs, setOrgs] = useState<string[]>([]);
  const [bounds, setTimeBounds] = useState<[number, number]>([0, 10]);
  const [bounties, setBounties] = useState<IAsyncResult<any[]>>();
  const [filters, setFilters] = useState<Filters>({
    mints: mints,
    tags: tags,
    orgs: orgs,
    estimatedTimeBounds: bounds,
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
          setBounties({ result: bounties });
        } catch (e) {
          console.log("error getting bounties: ", e);
          setBounties({ error: e });
        } finally {
          setBounties({ isLoading: false });
        }
      }
    };
    getBs();
  }, [router, currentUser?.id, filters.isMyBounties]);

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
      bountyEstimate < filters.estimatedTimeBounds[0] ||
      bountyEstimate > filters.estimatedTimeBounds[1]
    ) {
      return false;
    }

    return true;
  });

  useEffect(() => {
    // Get the meta-info off all bounties that are used for filters. Specifically
    // - all tags for bounties
    // - all orgs posting bounties
    // - all payout mints
    // - upper and lower bounds of estimated time completion
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
        bounties?.result.map((bounty) => bounty.repository?.organization)
      );
      const uniqueMints = getUniqueItems(
        bounties?.result.map((bounty) => bounty.escrow.mint.ticker)
      );
      setTags(uniqueTags);
      setOrgs(uniqueOrgs);
      setMints(uniqueMints);
      const allTimes = bounties?.result.map((bounty) =>
        parseFloat(bounty.estimatedTime.toString())
      );
      const maxTime = Math.max(...allTimes) || 10;
      const minTime = Math.min(...allTimes) || 0;
      const timeBounds: [number, number] = [
        minTime,
        maxTime === minTime ? maxTime + 1 : maxTime,
      ];
      setTimeBounds(timeBounds);
      setFilters({
        mints: uniqueMints,
        tags: allTags,
        orgs: uniqueOrgs,
        estimatedTimeBounds: timeBounds,
        states: TABLE_BOUNTY_STATES,
        relationships: BOUNTY_USER_RELATIONSHIP,
        isMyBounties: filters.isMyBounties,
      });
    }
  }, [bounties]);

  return (
    <div className="bounty-table" id="bounties-table">
      <div className="empty-cell" />
      <h1 className="page-header">{`Bounties`}</h1>

      <BountyFilters
        mints={mints}
        tags={tags}
        timeBounds={bounds}
        orgs={orgs}
        filters={filters}
        setFilters={setFilters}
        setBounties={setBounties}
      />

      {bounties?.isLoading && (
        <div className="w-full flex flex-col items-center">
          <LoadingBar title="Loading Bounties" />
        </div>
      )}

      <div className="issue-list" id="bounties-list">
        {!bounties?.isLoading && filteredBounties?.length === 0 && (
          <p className="w-full text-center col-span-2">
            No matching bounties available!
          </p>
        )}
        {filteredBounties?.length > 0 &&
          filteredBounties?.map((bounty, index) => {
            // console.log("bounty: ", bounty);
            return (
              <LancerBounty
                bounty={bounty}
                key={index}
                id={`bounty-item-${index}`}
              />
            );
          })}
      </div>
    </div>
  );
};

export default BountyList;
