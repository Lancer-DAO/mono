import { smallClickAnimation } from "@/src/constants";
import { User, UserPreview } from "@/types";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";

const ContributorInfo: React.FC<{
  user: User | UserPreview;
  disableLink?: boolean;
}> = ({ user, disableLink }) => {
  const router = useRouter();

  if (disableLink)
    return (
      <div className="flex items-center">
        <Image
          src={user.picture ? user.picture : ``}
          width={40}
          height={40}
          alt={user.name}
          className="h-[25px] w-[25px] rounded-full"
        />
        <div className="mx-[10px]">{user.name}</div>
      </div>
    );

  return (
    user &&
    !!user.picture && (
      <motion.button
        {...smallClickAnimation}
        className={`flex items-center cursor-pointer hover:text-blue-400`}
        onClick={() => {
          router.push(`/account/${user.id}`);
        }}
      >
        <Image
          src={user.picture ? user.picture : ``}
          width={40}
          height={40}
          alt={user.name}
          className="h-[25px] w-[25px] rounded-full"
        />
        <div className="mx-[10px]">{user.name}</div>
      </motion.button>
    )
  );
};

export default ContributorInfo;
