import { useUserWallet } from "@/src/providers";
import { api } from "@/src/utils";
import { UploadButton } from "@/src/utils/uploadthing";
import "@uploadthing/react/styles.css";
import { Trash } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";
import { motion } from "framer-motion";
import { smallClickAnimation } from "@/src/constants";

const ResumeCard = () => {
  const router = useRouter();
  const { currentUser } = useUserWallet();
  const { data: fetchedUser } = api.users.getUser.useQuery(
    {
      id: parseInt(router.query.account as string) || currentUser.id,
    },
  );
  const { mutateAsync: updateResume } = api.users.updateResume.useMutation();
  const { mutateAsync: deleteResume } = api.users.deleteMedia.useMutation();
  const [resumeUrl, setResumeUrl] = useState(fetchedUser?.resume);
    

  const handleResumeUpload = async (url) => {
    const { resume } = await updateResume({ resume: url })
    setResumeUrl(resume);
  }

  const handleResumeDelete = async () => {
    await deleteResume({ fileUrl: resumeUrl });
    setResumeUrl("");
  }

  return (
    <div className="relative w-full md:w-[658px] rounded-xl bg-bgLancerSecondary/[8%] overflow-hidden p-6 pt-8 pb-10">
      <p className="font-bold text-2xl text-textGreen mb-4">Resume</p>
      {resumeUrl ? (
        <div className="flex">
          <Link href={resumeUrl} target="_blank" className="inline-block px-4 py-4 bg-white border border-primaryBtnBorder uppercase rounded-md gap-2 text-textGreen text-xs whitespace-nowrap overflow-hidden hover:underline">
            View Your Resume
          </Link>
          <button
            className="ml-2 px-3 py-3 my-1 bg-secondaryBtn border border-secondaryBtnBorder rounded-md"
            {...smallClickAnimation}
            onClick={handleResumeDelete}
          >
            <Trash size={18} strokeWidth={1.25} />
          </button>
        </div>
      ) : (
        <UploadButton
          endpoint="pdfUploader"
          onClientUploadComplete={(res) => {
            handleResumeUpload(res.at(0).url);
          }}
          onUploadError={(error: Error) => {
            console.log(error);
            alert(`ERROR! ${error.message}`);
          }}
        />
      )}
    </div>
  )
}

export default ResumeCard;