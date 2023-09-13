import { FC, Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { Modal } from "@/components";
import { BountyActionsButton } from "../../bounties/Bounty/components";
import { api } from "@/src/utils";

interface Props {
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

export const CompleteProfileModal: FC<Props> = ({ setShowModal }) => {
  const { mutateAsync: updateResume } = api.users.updateResume.useMutation();

  return (
    <Modal
      setShowModal={setShowModal}
      disableOutsideClick
      className="py-20 relative"
    >
      <div className="w-full flex flex-col items-center justify-center gap-5 max-w-[400px] mx-auto">
        <h1 className="text-center">
          Welcome to the Public Beta. Almost Done!
        </h1>
        <p className="text-center">
          Complete your profile to be considered for full access to Lancer.
          Benefits include:
        </p>
        <ol className="text-center">
          <li>1. Unlock messaging</li>
          <li>2. Gain access to all Quests</li>
          <li>3. Referral commissions for inviting others</li>
        </ol>

        <BountyActionsButton
          type="green"
          text="Complete Profile"
          onClick={() => {
            updateResume({ resume: "" });

            setShowModal(false);
          }}
        />
      </div>
      <Image
        src="/assets/images/knight_right.png"
        width={154}
        height={144}
        className="absolute bottom-0 right-0"
        alt="knight"
      />
      <Image
        src="/assets/images/knight_left.png"
        width={154}
        height={144}
        className="absolute bottom-0 left-0"
        alt="knight"
      />
    </Modal>
  );
};
