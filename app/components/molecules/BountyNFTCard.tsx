import { BountyNFT } from "@/types/";
import Image from "next/image";

const BountyNFTCard = ({ bountyNFT }: { bountyNFT: BountyNFT }) => {
  return (
    <>
      <div className="flex items-center gap-10 border border-white-900 rounded-[20px] p-4 max-w-[600px] mx-auto">
        <Image
          src={"/assets/images/Lancer Gradient No Background 1.png"}
          width={80}
          height={80}
          alt="Lancer Logo"
        />
        {/* <img src={bountyNFT.image} className="bounty-picture" /> */}

        <div className="flex flex-col items-center justify-center">
          <h4>{bountyNFT.name}</h4>
          <div className="bounty-nft-subheader">
            {bountyNFT.reputation} pts | {bountyNFT.completed?.fromNow()} |{" "}
            {bountyNFT.role}
          </div>
        </div>
        {bountyNFT.tags?.length > 0 && (
          <div className="tag-list">
            {bountyNFT.tags.map((badge) => (
              <div className="tag-item" key={badge}>
                {badge}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default BountyNFTCard;
