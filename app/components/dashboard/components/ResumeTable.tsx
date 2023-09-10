import { api } from "@/src/utils";
import { User } from "@/types";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

export const ResumeTable = () => {
  const [waitlistedUsers, setWaitlistedUsers] = useState([]);
  const { data: fetchedUsers, refetch: refetchUsers } = api.users.getWaitlistedUsers.useQuery();
  const { mutateAsync: approveUser } = api.users.approveUser.useMutation();

  const meetsRequirements = (user) => {
    const conditions = [
      user.bio,
      user.website,
      user.twitter,
      user.github,
      user.portfolio,
    ];

    const metConditions = conditions.filter((condition) => condition !== null);

    return user.resume || metConditions.length >= 2;
  };

  const onApproveUser = async (user) => {
    await approveUser({ id: user.id });
    await refetchUsers();
    toast.success(`${user.name} has been approved!`)
  }

  useEffect(() => {
    const filteredUsers = fetchedUsers?.filter((user) => meetsRequirements(user));
    setWaitlistedUsers(filteredUsers);
  }, [fetchedUsers])
  


  return (
    <div className="w-2/3 bg-bgLancerSecondary/[8%] rounded-xl p-1">
      <table className="w-full">
        <thead>
          <tr className="grid grid-cols-3 gap-8 border-b font-extrabold p-3">
            <td className="col-span-1">Lancer</td>
            <td className="col-span-1">Resume</td>
            <td className="col-span-1">Approve User</td>
          </tr>
        </thead>
        <tbody>
          {waitlistedUsers?.map((user) => (
            <tr key={user.id} className="grid grid-cols-3 gap-8 border-b p-3">
              <td className="col-span-1">
                <Link href={`/account/${user.id}`}>{user.name}</Link>
              </td>
              <td className="col-span-1">
                {user?.resume ? (
                  <Link href={user.resume} target="true">View Resume</Link>
                ) : (
                  <p></p>
                )}
              </td>
              <td className="col-span-1">
                <button onClick={() => onApproveUser(user)}>
                  Accept
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
};