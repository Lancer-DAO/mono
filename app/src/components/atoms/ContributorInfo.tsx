import { Contributor } from "@/src/types";

const ContributorInfo: React.FC<{ user: Contributor }> = ({ user }) => {
  return (
    user && (
      <div className="flex items-center">
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
