import { BOUNTY_USER_RELATIONSHIP, RELATIONS } from "@/types/";
import { Button, MultiSelectDropdown } from "@/components";
import { Check } from "react-feather";
import { api } from "@/src/utils/api";
import { useBounty } from "@/src/providers/bountyProvider";
import { BountyUserType } from "@/prisma/queries/bounty";
import { useState } from "react";
import { capitalize } from "lodash";
import Image from "next/image";

export type AdminRelationsManagerSectionType = "approved" | "requested";
interface AdminRelationsManagerSectionProps {
  user: BountyUserType;
  //   type: AdminRelationsManagerSectionType;
}

export const TABLE_BOUNTY_STATES = Object.values(
  BOUNTY_USER_RELATIONSHIP
).slice(2);

export const AdminRelationsManagerSection: React.FC<
  AdminRelationsManagerSectionProps
> = ({ user }: AdminRelationsManagerSectionProps) => {
  const { currentBounty, setCurrentBounty } = useBounty();
  const { mutateAsync } = api.bountyUsers.updateRelations.useMutation();
  const [newRelations, setNewRelations] = useState(user.relations);

  if (!currentBounty) return null;
  const disabled = newRelations === user.relations;

  const handleRelationUpdate = async () => {
    const updatedBounty = await mutateAsync({
      bountyId: currentBounty?.id,
      userId: user.userid,
      relations: newRelations,
    });
    setCurrentBounty(updatedBounty);
  };

  return (
    <div className="submitter-section flex items-center">
      <div className="flex items-center gap-2">
        <Image
          src={user.user.picture}
          alt="user avatar"
          width={36}
          height={36}
          className="rounded-full overflow-hidden"
        />
        <div className="flex flex-col">
          <p className="text-neutral600 title-text">{user.user.name}</p>
          <p className="text-neutral500 text-xs">{`${user.user.experience} XP`}</p>
        </div>
      </div>
      <div className="items-center ml-2 flex justify-center">
        <>
          <MultiSelectDropdown
            version="white"
            options={RELATIONS.map((state) => {
              return {
                value: state,
                label: state
                  .split("_")
                  .map((_state) => capitalize(_state))
                  .join(" "),
              };
            })}
            selected={newRelations.map((state) => {
              return {
                value: state,
                label: state
                  .split("_")
                  .map((_state) => capitalize(_state))
                  .join(" "),
              };
            })}
            onChange={(options) => {
              setNewRelations(
                options.map(
                  (option) => option.value
                ) as BOUNTY_USER_RELATIONSHIP[]
              );
            }}
          />
          <Button
            onClick={async () => {
              await handleRelationUpdate();
            }}
            className="h-12 ml-2"
            disabledText="Fund Quest To Manage Applicants"
            disabled={disabled}
          >
            <Check
              color={disabled ? "gray" : "#14bb88"}
              width="20px"
              height="20px"
            />
          </Button>
        </>
      </div>
    </div>
  );
};
