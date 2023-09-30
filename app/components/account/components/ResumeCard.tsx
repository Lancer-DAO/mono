import { Spinner } from "@/components/molecules/Spinner";
import { api } from "@/src/utils";
import { useUploadThing } from "@/src/utils/uploadthing";
import "@uploadthing/react/styles.css";
import { Image as ImageIcon, Trash2 } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { UploadCloud } from "react-feather";
import toast from "react-hot-toast";
import {
  generateMimeTypes,
  generatePermittedFileTypes,
} from "uploadthing/client";

export const ResumeCard: React.FC<{
  resumeUrl: string;
  setResumeUrl: Dispatch<SetStateAction<string>>;
  setShowModal?: (value: boolean) => void;
  editing?: boolean;
}> = ({ setShowModal, setResumeUrl, resumeUrl, editing }) => {
  const { mutateAsync: updateResume } = api.users.updateResume.useMutation();
  const { mutateAsync: deleteResume } = api.users.deleteResume.useMutation();

  const [isAwaitingResponse, setIsAwaitingResponse] = useState(false);

  const hasResume = (resume: string) => {
    return resume !== "" && resume !== null;
  };

  const { startUpload, isUploading, permittedFileInfo } = useUploadThing(
    "pdfUploader",
    {
      onClientUploadComplete: (res) => {
        handleResumeUpload(res.at(0).url);
      },
      onUploadError: (error: Error) => {
        console.log(error);
        toast.error(`Error uploading resume: ${error.message}`);
      },
    }
  );

  const { fileTypes } = generatePermittedFileTypes(permittedFileInfo?.config);

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

  const handleResumeUpload = async (url: string) => {
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
      toast.success("Resume deleted successfully");
    } catch (error) {
      console.log(error);
      toast.error(`Error deleting resume: ${error.message}`);
    }
  };

  return (
    <>
      {hasResume(resumeUrl) && (
        <div className="flex items-center gap-2">
          {editing && (
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
      )}
      {!hasResume(resumeUrl) && editing && (
        <label className="min-w-[105px] rounded-md bg-white border border-neutral200 flex items-center justify-center gap-2 h-8 px-2 cursor-pointer">
          <input
            className="hidden"
            type="file"
            accept={generateMimeTypes(fileTypes ?? [])?.join(", ")}
            onChange={(e) => {
              if (!e.target.files) return;
              void startUpload(Array.from(e.target.files));
            }}
            disabled={isAwaitingResponse}
          />
          {isUploading ? (
            <Spinner />
          ) : (
            <>
              <UploadCloud color="#A1B2AD" size={18} />
              <p className="text-xs text-neutral400 truncate">Upload resume</p>
            </>
          )}
        </label>
      )}
    </>
  );
};
