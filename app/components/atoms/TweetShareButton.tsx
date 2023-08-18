import { FC } from "react";
import Image from "next/image";
import { smallClickAnimation } from "@/src/constants";
import { motion } from "framer-motion";

interface Props {
  url?: string;
}

const TwitterShareButton: FC<Props> = ({ url }) => {
  // The text you want to tweet out
  const tweetText = `I just created a Quest on @Lancerworks. Looking to hire a freelancer to help me with my project. Check it out here: ${url}`;

  // Construct the Twitter link with the encoded tweet text
  const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}`;

  return (
    <motion.a
      {...smallClickAnimation}
      href={twitterLink}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Image
        src="/assets/images/share/twitter.png"
        width={40}
        height={40}
        alt="X / twitter"
      />
    </motion.a>
  );
};

export default TwitterShareButton;
