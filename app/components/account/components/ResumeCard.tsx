import { UploadButton } from "@/src/utils/uploadthing";
import "@uploadthing/react/styles.css";
import { useState } from "react";

const ResumeCard = () => {
  const [resumeUrl, setResumeUrl] = useState("");
  const handleResumeUpload = (url) => {
    setResumeUrl(url);
  }

  return (
    <div className="relative w-full md:w-[658px] rounded-xl bg-bgLancerSecondary/[8%] overflow-hidden p-6 pt-8 pb-10">
      <p className="font-bold text-2xl text-textGreen mb-4">Upload Your Resume</p>
      <UploadButton
        endpoint="pdfUploader"
        onClientUploadComplete={(res) => {
          handleResumeUpload(res.at(0).url);
        }}
        onUploadError={() => {}}
      />
    </div>
  )
}

export default ResumeCard;