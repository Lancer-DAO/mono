import { FC, Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { Modal } from "@/components";
import { QuestActionsButton } from "../../quests/Quest/components";
import { useUserWallet } from "@/src/providers";

interface Props {
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

const { currentUser } = useUserWallet();

export const CompleteProfileModal: FC<Props> = ({ setShowModal }) => {
  return (
    <Modal
      setShowModal={setShowModal}
      disableOutsideClick
      className="py-20 relative"
    >
      <div className="w-full flex flex-col items-center justify-center gap-5 max-w-[400px] mx-auto">
        <h1 className="text-center">Profile Complete!</h1>
        <p className="text-center">
          You are now qualified to be considered for full access to Lancer.
          Benefits include:
        </p>
        <ol className="text-center">
          <li className="font-bold">1. Unlock messaging</li>
          <li className="font-bold">
            {currentUser.class === "Lancer" ? "2. Apply to Quests" : "2. Create Quests"}
          </li>
          <li className="font-bold">
            3. Referral commissions for inviting others
          </li>
        </ol>
        <p className="text-center">
          You&apos;ll be notified when you&apos;ve been approved.
        </p>

        <QuestActionsButton
          type="green"
          text="Got it"
          onClick={() => {
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
