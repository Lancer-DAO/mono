import { FC, Dispatch, SetStateAction } from "react";
import { Modal } from "@/components";
import { BountyActionsButton } from "../bounties/Bounty/components";

interface Props {
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

const ResumeModal: FC<Props> = ({ setShowModal }) => {
  return (
    <Modal setShowModal={setShowModal} disableOutsideClick className="py-20">
      <div className="w-full px-10">
        <div className="w-full flex items-start justify-center gap-20">
          <div className="w-full flex flex-col gap-5 max-w-[400px]">
            <h1>Welcome to the Lancer Public Beta</h1>
            <p>
              We are accepting applications for lancers at this time. Please
              upload your resume to complete the application process. We will be
              accepting talent on a rolling basis.
            </p>
            <p>Your information will not be shared.</p>
          </div>
          <BountyActionsButton
            type="green"
            text="Got it"
            onClick={() => setShowModal(false)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ResumeModal;
