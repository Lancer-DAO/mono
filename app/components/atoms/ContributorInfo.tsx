import { User } from "@prisma/client";
import Image from "next/image";
import { useRouter } from "next/router";

const ContributorInfo: React.FC<{ user: User; disableLink?: boolean }> = ({
  user,
  disableLink,
}) => {
  const router = useRouter();
  return (
    user &&
    (!!user.githubId || user.picture) && (
      <div
        className="flex items-center hover:cursor-pointer  hover:text-blue-400"
        onClick={() => {
          if (disableLink) return;
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
          width={25}
          height={25}
          alt={user.name ? user.name : user.githubLogin}
          className="h-[25px] w-[25px] rounded-full shadow-md shadow-black-300"
        />
        <div className="ml-[10px] text-xs font-bold">
          {user.name ? user.name : user.githubLogin}
        </div>
      </div>
    )
  );
};

export default ContributorInfo;
