import { useState } from "react";
import { api } from "@/src/utils";
import { UploadButton } from "@/src/utils/uploadthing";
import "@uploadthing/react/styles.css";
import { Image as ImageIcon, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export const ResumeCard: React.FC<{
  resumeUrl: string;
  setResumeUrl: (value: string) => void;
  preview?: boolean;
  setShowModal?: (value: boolean) => void;
}> = ({ preview, setShowModal, setResumeUrl, resumeUrl }) => {
  const { mutateAsync: updateResume } = api.users.updateResume.useMutation();
  const { mutateAsync: deleteResume } = api.users.deleteResume.useMutation();

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
            Are you sure you want to delete your resume?
            <div className="mt-2 flex items-center gap-4 justify-center">
              <button
                onClick={handleYes}
                className="bg-white border border-neutral300 text-error flex title-text
                items-center justify-center rounded-md px-3 py-1"
              >
                Yes
              </button>
              <button
                onClick={handleNo}
                className="bg-primary200 flex text-white title-text
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
    setResumeUrl(resume);
    setShowModal && setShowModal(false);
  };

  const handleResumeDelete = async () => {
    await confirmAction();
    try {
      await updateResume({ resume: "" });
      await deleteResume({ fileUrl: resumeUrl });
      setResumeUrl("");
    } catch (error) {
      console.log(error);
      toast.error(`Error deleting resume: ${error.message}`);
    }
  };

  return (
    <>
      {resumeUrl !== "" ? (
        <div className="flex items-center gap-2">
          {setResumeUrl !== null && (
            <button
              disabled={isAwaitingResponse}
              onClick={() => handleResumeDelete()}
            >
              <Trash2 color="#A1B2AD" size={18} />
            </button>
          )}
          <button
            className="rounded-md bg-white border border-neutral200 flex items-center justify-center gap-2 h-8 px-2"
            onClick={() => {
              window.open(resumeUrl, "_blank", "noopener noreferrer");
            }}
            disabled={isAwaitingResponse}
          >
            <ImageIcon color="#A1B2AD" size={18} />
            <p className="text-xs text-neutral400 truncate">resume.pdf</p>
          </button>
        </div>
      ) : (
        <UploadButton
          appearance={{
            button:
              "bg-neutral100 border border-neutral200 text-neutral500 ut-uploading:cursor-not-allowed px-2",
            allowedContent: {
              color: "#14BB88",
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
    </>
  );
};
