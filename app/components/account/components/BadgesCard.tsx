import { FC, useEffect, useState } from "react";
import { BADGES_PROJECT_PARAMS } from "@/src/constants";
import { BountyNFT } from "@/types";
import { createUnderdogClient } from "@underdog-protocol/js";
import dayjs from "dayjs";
import Image from "next/image";
import badgeList from "./badgesnfts.json";
import { LoadingBar, Tooltip } from "@/components";
import { useAccount } from "@/src/providers/accountProvider";
import { api } from "@/src/utils";

type BadgeListItem = {
  name: string;
  reputation: number;
  tags: string[];
  image: string;
  completed?: string;
  role: string;
  id: number;
  ownerAddress: string;
};

const Badge = ({ badge }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`relative group ${hovered ? "z-50" : "z-0"}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      key={badge.id}
    >
      <Image src={badge.image} alt={badge.name} width={50} height={50} />
      <Tooltip text={`Quest ${badge.name}`} />
    </div>
  );
};

const badgesList = badgeList as BadgeListItem[];

const underdogClient = createUnderdogClient({});

export const BadgesCard: FC = () => {
  const { account } = useAccount();
  const { data: wallets } = api.users.getWallets.useQuery(
    {
      id: account?.id,
    },
    {
      enabled: !!account,
    }
  );

  const [badges, setBadges] = useState<BountyNFT[]>([]);
  const [loading, setLoading] = useState(false);

  const getBadgeNFTSForWallet = async (wallet: string) => {
    const nfts = await underdogClient.getNfts({
      params: BADGES_PROJECT_PARAMS,
      query: {
        page: 1,
        limit: 12,
        ownerAddress: wallet,
      },
    });
    const badgeNFTs: BountyNFT[] = nfts.results.map((nft) => {
      const { name, attributes, image, id, ownerAddress } = nft;
      return {
        name: name,
        experience: attributes.reputation as number,
        tags:
          attributes.tags !== "" ? (attributes.tags as string)?.split(",") : [],
        image: image,
        completed: attributes.completed
          ? dayjs(attributes.completed)
          : undefined,
        description: attributes.description as string,
        role: attributes.role as string,
        id,
        ownerAddress,
      };
    });
    badgeNFTs.reverse();
    return badgeNFTs;
  };

  const fetchBadgeNFTs = async () => {
    setLoading(true);
    const addresses = wallets.map((wallet) => wallet.publicKey);
    const badges = [];
    const allNfts = addresses.map(async (address) => {
      const nfts = await getBadgeNFTSForWallet(address);
      badges.push(...nfts);
    });
    await Promise.all(allNfts);

    setBadges(badges);
    setLoading(false);
  };

  useEffect(() => {
    if (wallets) {
      fetchBadgeNFTs();
    }
  }, [wallets]);

  return (
    <div className="w-full pt-0 p-5 pb-16">
      <p className="title-text text-neutral600">Badges</p>
      {loading ? (
        <div className="w-full flex items-center justify-center">
          <LoadingBar title={null} />
        </div>
      ) : null}
      {badges?.length > 0 && !loading ? (
        <div className="flex flex-wrap gap-3">
          {badges.map((badge) => (
            <Badge badge={badge} key={badge.id} />
          ))}
        </div>
      ) : null}
      {badges?.length === 0 && !loading ? <div>No Badges Yet</div> : null}
    </div>
  );
};
