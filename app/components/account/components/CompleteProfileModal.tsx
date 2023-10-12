import { FC, Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { Modal } from "@/components";
import { QuestActionsButton } from "../../quests/Quest/components";
import { useUserWallet } from "@/src/providers";

interface Props {
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

export const CompleteProfileModal: FC<Props> = ({ setShowModal }) => {
  const { currentUser } = useUserWallet();

  return (
    <Modal
      setShowModal={setShowModal}
      disableOutsideClick
      className="py-20 relative"
    >
      <div className="text-neutral500 w-full flex flex-col items-center justify-center gap-5 max-w-[400px] mx-auto">
        <h1 className="text-center text-neutral600">Profile Complete!</h1>
        <p className="text-center">
          You are now in line for full access to Lancer. Benefits include:
        </p>
        <ol className="text-center">
          <li className="font-bold">1. Messaging other Users</li>
          <li className="font-bold">
            {currentUser.class === "Lancer"
              ? "2. Applying to Quests"
              : "2. Creating Quests"}
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
