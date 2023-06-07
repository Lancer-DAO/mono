import { Contributor } from "@/src/types";
import { useRouter } from "next/router";

const ContributorInfo: React.FC<{ user: Contributor }> = ({ user }) => {
  const router = useRouter();
  return (
    user && (
      <div
        className="flex items-center hover:cursor-pointer  hover:text-blue-400"
        onClick={() => {
          router.push(`/account?id=${user.user.id}`);
        }}
      >
        <img
          className="h-[20px] w-[20px] rounded-full shadow-md shadow-black-300"
          src={`https://avatars.githubusercontent.com/u/${
            user.user.githubId.split("|")[1]
          }?s=60&v=4`}
        />
        <div className="ml-[10px]">{user.user.githubLogin}</div>
      </div>
    )
  );
};

export default ContributorInfo;