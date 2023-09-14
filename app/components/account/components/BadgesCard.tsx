import { BADGES_PROJECT_PARAMS } from "@/src/constants";
import { useUserWallet } from "@/src/providers";
import { BountyNFT, ProfileNFT } from "@/types";
import { createUnderdogClient } from "@underdog-protocol/js";
import dayjs from "dayjs";
import { FC, useEffect, useState } from "react";
import Image from "next/image";
import badgeList from "./badgesnfts.json";
import { Tooltip } from "@/components";https://github.com/Lancer-DAO/mono/pull/190/conflict?name=app%252Fcomponents%252Faccount%252Fcomponents%252FBadgesCard.tsx&ancestor_oid=e14036f2f013e36a5a75df58ec4f7cb9ed061f41&base_oid=7cbccae3cea1831a70b81b8f7e6e834f2d7c4513&head_oid=a9a0aadf878233113f3c837c917a1f93dfd0cd9a

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
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

const badgesList = badgeList as BadgeListItem[];

const underdogClient = createUnderdogClient({});

const BagesCard: FC = () => {
  const { currentWallet } = useUserWallet();
  const [badges, setBadges] = useState<BountyNFT[]>([]);

  const fetchBountyNFTs = async () => {
    const nfts = await underdogClient.getNfts({
      params: BADGES_PROJECT_PARAMS,
      query: {
        page: 1,
        limit: 12,
        ownerAddress: currentWallet.publicKey.toBase58(),
      },
    });
    const bountyNFTs: BountyNFT[] = nfts.results.map((nft) => {
      const { name, attributes, image, id, ownerAddress } = nft;
      return {
        name: name,
        reputation: attributes.reputation as number,
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
    bountyNFTs.reverse();
    setBadges(bountyNFTs);
  };

  useEffect(() => {
    if (currentWallet) {
      fetchBountyNFTs();
    }
  }, [currentWallet]);

  return (
    <div className="w-full md:w-[460px] max-h-[320px] rounded-xl bg-bgLancerSecondary/[8%] overflow-hidden p-6">
      <p className="font-bold text-2xl text-textGreen">Badges</p>
      {badges?.length > 0 ? (
        <div className="grid grid-cols-6 gap-2">
          {/* TODO: badges need images and to be styled */}
          {badges.map((badge) => (
            <div className="relative group tag-item" key={badge.id}>
              <Image
                src={badge.image}
                alt={badge.name}
                width={50}
                height={50}
              />
              <Tooltip text={`Quest ${badge.name}`} />
            </div>
          ))}
        </div>
      ) : (
        <div>No Badges Yet</div>
      )}
    </div>
  );
};
