import { Contributor } from "@/src/types";

export const ContributorInfo: React.FC<{ user: Contributor }> = ({ user }) => {
  return (
    user && (
      <div className="contributor-info">
        <img
          className="contributor-picture-small"
          src={`https://avatars.githubusercontent.com/u/${user.user.githubId}?s=60&v=4`}
        />
        <div className="contributor-name">{user.user.githubLogin}</div>
      </div>
    )
  );
};
