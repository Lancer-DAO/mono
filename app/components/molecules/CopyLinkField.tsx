import { Logo } from "@/components";
import Link from "next/link";
import { FC, useState } from "react";
import { Copy } from "react-feather";

interface Props {
  url: string;
  logo?: boolean;
  link?: boolean;

}

const CopyLinkField: FC<Props> = ({ url, logo = false, link = false }) => {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleCopyClick = (text: string) => {
    copyToClipboard(text);
    setTimeout(() => setIsCopied(false), 2000); // Reset the isCopied state after 2 seconds
  };

  return (
    <div className="flex justify-between items-center px-4 py-4 bg-white border border-primaryBtnBorder uppercase rounded-md gap-2">
      {logo ?? <Logo height="24" width="24" />}
      {link ? (
        <Link href={url} target="_blank" className="text-textGreen text-xs whitespace-nowrap overflow-hidden hover:underline">{url}</Link>
      ) : (
      <p className="text-textGreen text-xs whitespace-nowrap overflow-hidden">
        {url}
      </p>

      )}
      <div className="relative">
        <Copy className="cursor-pointer" onClick={() => handleCopyClick(url)} />
        <div
          className={`absolute text-sm right-0 -bottom-10 transition-opacity duration-500 ${
            isCopied ? "opacity-100" : "opacity-0"
          }`}
        >
          {"Copied!"}
        </div>
      </div>
    </div>
  );
};

export default CopyLinkField;
