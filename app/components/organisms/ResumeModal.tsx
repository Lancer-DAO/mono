import { FC, Dispatch, SetStateAction } from "react";
import Image from "next/image";
import { Modal } from "@/components";
import { BountyActionsButton } from "../bounties/Bounty/components";
import ResumeCard from "../account/components/ResumeCard";
import { User } from "@/types";

interface Props {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  resumeUrl: string;
  setResumeUrl: (value: string) => void;
}

const ResumeModal: FC<Props> = ({ setShowModal, resumeUrl, setResumeUrl }) => {
  return (
    <Modal
      setShowModal={setShowModal}
      disableOutsideClick
      className="py-20 relative"
    >
      <div className="w-full flex flex-col items-center justify-center gap-5 max-w-[400px] mx-auto">
        <h1 className="text-center">Welcome to the Lancer Public Beta</h1>
        <p className="text-center">
          We are accepting applications for Lancers at this time. Please upload
          your resume via the Account page to complete the application process.
        </p>
        <p className="text-center">
          We will be accepting talent on a rolling basis. Your information will
          not be shared.
        </p>
        <ResumeCard
          resumeUrl={resumeUrl}
          setResumeUrl={setResumeUrl}
          preview
          setShowModal={setShowModal}
        />

        <BountyActionsButton
          type="red"
          text="Upload Later"
          onClick={() => setShowModal(false)}
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

export default ResumeModal;
