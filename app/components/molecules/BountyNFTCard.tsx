import { BountyNFT } from "@/src/types";

const BountyNFTCard = ({ bountyNFT }: { bountyNFT: BountyNFT }) => {
  return (
    <>
      <div className="bounty-nft">
        <img
          src={"/assets/images/Lancer Gradient No Background 1.png"}
          className="bounty-picture"
        />
        {/* <img src={bountyNFT.image} className="bounty-picture" /> */}

        <div className="bounty-nft-header">
          <div>
            <h4>{bountyNFT.name}</h4>
            <div className="bounty-nft-subheader">
              {bountyNFT.reputation} Pts | {bountyNFT.completed?.fromNow()} |{" "}
              {bountyNFT.role}
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
        </div>
      </div>
    </>
  );
};

export default BountyNFTCard;
