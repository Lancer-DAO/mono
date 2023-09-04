import { smallClickAnimation } from "@/src/constants";
import { User } from "@prisma/client";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/router";

const ContributorInfo: React.FC<{ user: User; disableLink?: boolean }> = ({
  user,
  disableLink,
}) => {
  const router = useRouter();

  if (disableLink)
    return (
      <div className="flex items-center">
        <Image
          src={
            user.picture
              ? user.picture
              : `https://avatars.githubusercontent.com/u/${
                  user.githubId.split("|")[1]
                }?s=60&v=4`
          }
          width={40}
          height={40}
          alt={user.name ? user.name : user.githubLogin}
          className="h-[25px] w-[25px] rounded-full"
        />
        <div className="mx-[10px]">
          {user.name ? user.name : user.githubLogin}
        </div>
      </div>
    );

  return (
    user &&
    (!!user.githubId || user.picture) && (
      <motion.button
        {...smallClickAnimation}
        className={`flex items-center cursor-pointer hover:text-blue-400`}
        onClick={() => {
          router.push(`/account/${user.id}`);
        }}
      >
        <Image
          src={
            user.picture
              ? user.picture
              : `https://avatars.githubusercontent.com/u/${
                  user.githubId.split("|")[1]
                }?s=60&v=4`
          }
          width={40}
          height={40}
          alt={user.name ? user.name : user.githubLogin}
          className="h-[25px] w-[25px] rounded-full"
        />
        <div className="mx-[10px]">
          {user.name ? user.name : user.githubLogin}
        </div>
      </motion.button>
    )
  );
};

export default ContributorInfo;
