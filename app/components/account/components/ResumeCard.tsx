import { useUserWallet } from "@/src/providers";
import { useAccount } from "@/src/providers/accountProvider";
import { api } from "@/src/utils";
import { UploadButton } from "@/src/utils/uploadthing";
import "@uploadthing/react/styles.css";
import { Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";

const ResumeCard = () => {
  const router = useRouter();
  const { currentUser } = useUserWallet();
  const { account } = useAccount();

  const { mutateAsync: updateResume } = api.users.updateResume.useMutation();
  const { mutateAsync: deleteResume } = api.users.deleteResume.useMutation();

  const [resumeUrl, setResumeUrl] = useState(account?.resume);
  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

  const confirmAction = (): Promise<void> => {
    setIsAwaitingResponse(true);

    return new Promise<void>((resolve, reject) => {
      const handleYes = () => {
        toast.dismiss(toastId);
        setIsAwaitingResponse(false);
        resolve();
      };

      const handleNo = () => {
        toast.dismiss(toastId);
        setIsAwaitingResponse(false);
        reject();
      };

      const toastId = toast(
        (t) => (
          <div>
            Are you sure you want to delete this resume?
            <div className="mt-2 flex items-center gap-4 justify-center">
              <button
                onClick={handleYes}
                className="border border-secondaryBtnBorder bg-secondaryBtn flex
                items-center justify-center rounded-md px-3 py-1"
              >
                Yes
              </button>
              <button
                onClick={handleNo}
                className="border border-primaryBtnBorder bg-primaryBtn flex
                items-center justify-center rounded-md px-3 py-1"
              >
                No
              </button>
            </div>
          </div>
        ),
        {
          duration: Infinity,
        }
      );
    });
  };

  const handleResumeUpload = async (url) => {
    const { resume } = await updateResume({ resume: url });
    localStorage.removeItem("newUser");
    setResumeUrl(resume);
  };

  const handleResumeDelete = async () => {
    await confirmAction();
    try {
      await updateResume({ resume: "" });
      await deleteResume({ fileUrl: resumeUrl });
      setResumeUrl("");
      localStorage.setItem("newUser", "true");
    } catch (error) {
      console.log(error);
      toast.error(`Error deleting resume: ${error.message}`);
    }
  };

  return (
    <div className="relative w-full md:w-[658px] rounded-xl bg-bgLancerSecondary/[8%] overflow-hidden p-6 pt-8 pb-10">
      <p className="font-bold text-2xl text-textGreen mb-4">Resume</p>
      {resumeUrl ? (
        <div className="flex">
          <Link
            href={resumeUrl}
            target="_blank"
            className="inline-block px-4 py-4 bg-white border border-primaryBtnBorder uppercase rounded-md gap-2 
            text-textGreen text-xs whitespace-nowrap overflow-hidden hover:underline"
          >
            View Your Resume
          </Link>
          <button
            className="ml-2 px-3 py-3 my-1 bg-secondaryBtn border border-secondaryBtnBorder rounded-md disabled:cursor-not-allowed"
            onClick={handleResumeDelete}
            disabled={isAwaitingResponse}
          >
            <Trash size={18} strokeWidth={1.25} />
          </button>
        </div>
      ) : (
        <UploadButton
          appearance={{
            button:
              "bg-[#D4FFD7] text-[#638463] ut-uploading:cursor-not-allowed after:bg-secondaryBtn",
            allowedContent: {
              color: "#638463",
              textTransform: "uppercase",
            },
          }}
          endpoint="pdfUploader"
          onClientUploadComplete={(res) => {
            handleResumeUpload(res.at(0).url);
          }}
          onUploadError={(error: Error) => {
            console.log(error);
            toast.error(`Error uploading resume: ${error.message}`);
          }}
        />
      )}
    </div>
  );
};

export default ResumeCard;
