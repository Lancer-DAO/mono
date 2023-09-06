import { api } from "@/src/utils";
import Link from "next/link";
import { useState } from "react";

export const ResumeTable = () => {
  const { data: fetchedUsers } = api.users.getWaitlistedUsers.useQuery();
  const { mutateAsync: approveUser } = api.users.approveUser.useMutation()


  return (
    <div className="w-1/3 bg-bgLancerSecondary/[8%] rounded-xl p-1">
      <table className="w-full">
        <thead>
          <tr className="grid grid-cols-3 gap-8 border-b font-extrabold p-3">
            <td className="col-span-1">Lancer</td>
            <td className="col-span-1">Resume</td>
            <td className="col-span-1">Approve User</td>
          </tr>
        </thead>
        <tbody>
          {fetchedUsers?.map((user) => (
            <tr key={user.id} className="grid grid-cols-3 gap-8 border-b p-3">
              <td className="col-span-1">
                <Link href={`/account/${user.id}`}>{user.name}</Link>
              </td>
              <td className="col-span-1">
                <Link href={user.resume}>View Resume</Link>
              </td>
              <td className="col-span-1">
                <button onClick={() => approveUser({ id: user.id})}>
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