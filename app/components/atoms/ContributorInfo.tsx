import { User } from "@prisma/client";
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
          router.push(`/account=/${user.id}`);
        }}
      >
        <img
          className="h-[20px] w-[20px] rounded-full shadow-md shadow-black-300"
          src={
            user.picture
              ? user.picture
              : `https://avatars.githubusercontent.com/u/${
                  user.githubId.split("|")[1]
                }?s=60&v=4`
          }
        />
        <div className="ml-[10px]">
          {user.name ? user.name : user.githubLogin}
        </div>
      </div>
    )
  );
};

export default ContributorInfo;
