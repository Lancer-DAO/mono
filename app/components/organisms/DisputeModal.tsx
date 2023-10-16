import { useState, FC, Dispatch, SetStateAction } from "react";
import { useBounty } from "@/src/providers/bountyProvider";
import { Modal } from "@/components";
import { CreateDispute, SettleDispute } from "../quests/Quest/components";

interface Props {
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

const DisputeModal: FC<Props> = ({ setShowModal }) => {
  const { currentBounty } = useBounty();
  const [hasCreatedDispute, setHasCreatedDispute] = useState(false);

  return (
    <Modal setShowModal={setShowModal} className="py-20">
      <div className="w-full px-10 flex flex-col gap-4">
        <div className="w-full flex items-start justify-center gap-20">
          <div className="w-full flex flex-col gap-5 max-w-[400px]">
            <h1>Handle Dispute</h1>
            <p>{`Quest Value: ${currentBounty.escrow.amount}`}</p>
          </div>
        </div>
        <CreateDispute setHasCreatedDispute={setHasCreatedDispute} />
        {hasCreatedDispute && <SettleDispute />}
      </div>
    </Modal>
  );
};

export default DisputeModal;
