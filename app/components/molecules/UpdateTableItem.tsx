import dayjs, { Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Alert, Flame, Mail, Message, ServiceBell } from "@/components";
dayjs.extend(relativeTime);
import { useRouter } from "next/router";
export type UpdateType = "submission" | "message" | "application" | "cancel";
export type SubmissionType =
  //   This submission was accepted
  | "accepted"
  //   This submission was rejected [second item in listed picture]
  | "rejected"
  //   This submission was requested changes
  | "vote-to-cancel"
  //   (client side) this quest has a new submission [third item in listed picture]
  | "new";
export type ApplicationType =
  //   (client side) A person sent an application
  | "applied"
  //   The person was accepted to the shortlist
  | "shortlisted"
  //   The person was at application stage but was rejected
  | "removed-shortlisted"
  //   The person was at application stage but was rejected
  | "denied"
  //   The person was accepted to complete the quest
  | "accepted";
export type CancelType =
  //   (client side) A person sent an application
  | "vote-to-cancel"
  //   The person was accepted to the shortlist
  | "cancel-escrow"
  //   The person was accepted to the shortlist
  | "start-dispute"
  //   The person was accepted to the shortlist
  | "settle-dispute";

export const getApplicationTypeFromLabel = (label: string): ApplicationType => {
  switch (label) {
    case "add-to-shortlist":
      return "shortlisted";

    case "add-approved-submitter":
      return "accepted";
    case "deny-submitter":
      return "denied";

    case "remove-from-shortlist":
      return "removed-shortlisted";
  }
};

type CommonProps = {
  time: Dayjs;
  extraProps?: {};
  key?: string | number;
  type: UpdateType;
  isIndividual?: boolean;
};

export type UpdateItemProps =
  | (CommonProps & {
      type: "submission";
      subType: SubmissionType;

      extraProps: {
        questName: string;
        description: string;
        updateName?: string;
        questId: number;
      };
    })
  | (CommonProps & {
      type: "application";
      subType: ApplicationType;
      extraProps: {
        questName: string;
        questId: number;
      };
    })
  | (CommonProps & {
      type: "cancel";
      subType: CancelType;
      extraProps: {
        questName: string;
        questId: number;
      };
    })
  | (CommonProps & {
      type: "message";
      subType?: never;
      extraProps: {
        messageCount: number;
        updater: string;
      };
    });

const UpdateTableItem: React.FC<UpdateItemProps> = ({
  type,
  subType,
  time,
  extraProps,
  isIndividual,
}) => {
  const router = useRouter();
  switch (type) {
    case "message":
      // return (
      //   <div className="flex px-8 py-4 items-center justify-start w-full border-solid border-b border-neutralBorder500">
      //     <Message height="32px" width="32px" />
      //     <div className="text-sm ml-1.5 text-neutral500 mr-4">{`${
      //       extraProps.messageCount
      //     } New message${extraProps.messageCount > 1 ? "s" : ""} from ${
      //       extraProps.updater
      //     }`}</div>
      //     <div className="text-sm mr-4">{`${time.fromNow()}`}</div>
      //   </div>
      // );
      return null;
    case "submission":
      switch (subType) {
        case "new":
          return (
            <div
              onClick={() => {
                if (!isIndividual) {
                  router.push(`/quests/${extraProps.questId}`);
                }
              }}
              className="flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-b border-neutralBorder500 hover:cursor-pointer"
            >
              <div className="flex justify-start items-center w-full">
                <ServiceBell height="32px" width="32px" />
                <div className="text-sm ml-1.5 text-neutral500 mr-2">
                  {`New Update for ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral200"></div>
                <div className="text-sm ml-2 text-neutral400">{`${time.fromNow()}`}</div>
                <div className="ml-auto flex items-center justify-end text text-neutral600"></div>
              </div>
              <div className="mt-4 rounded-md text-xs leading-normal text-neutral500 border border-neutralBorder-200 py-2.5 px-3.5 bg-neutral100 w-full rounder-md">
                {extraProps.description}
              </div>
            </div>
          );
        case "rejected":
          return (
            <div
              onClick={() => {
                if (!isIndividual) {
                  router.push(`/quests/${extraProps.questId}`);
                }
              }}
              className={`${
                isIndividual ? "" : "hover:cursor-pointer"
              } flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-b border-neutralBorder500`}
            >
              <div className="flex justify-start items-center w-full">
                <Flame height="32px" width="32px" version="orange" />
                <div className="text-sm ml-1.5 text-neutral500 mr-2">
                  {`Review for ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral200"></div>
                <div className="text-sm ml-2 text-neutral400 mr-auto">{`${time.fromNow()}`}</div>
                <div className="text-sm ml-auto text-neutral500">Rejected</div>
              </div>
              <div className="mt-4 rounded-md text-xs leading-normal text-neutral500 border border-neutralBorder-200 py-2.5 px-3.5 bg-neutral100 w-full rounder-md">
                {extraProps.description}
              </div>
            </div>
          );
        case "accepted":
          return (
            <div
              onClick={() => {
                if (!isIndividual) {
                  router.push(`/quests/${extraProps.questId}`);
                }
              }}
              className={`${
                isIndividual ? "" : "hover:cursor-pointer"
              } flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-b  border-neutralBorder500`}
            >
              <div className="flex justify-start items-center w-full">
                <Flame height="32px" width="32px" version="green" />
                <div className="text-sm ml-1.5 text-neutral500 mr-2">
                  {`Review for ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral200"></div>
                <div className="text-sm ml-2 text-neutral400 mr-auto">{`${time.fromNow()}`}</div>
                <div className="text-sm ml-auto text-neutral500">Accepted</div>
              </div>
              <div className="mt-4 rounded-md text-xs leading-normal text-neutral500 border border-neutralBorder-200 py-2.5 px-3.5 bg-neutral100 w-full rounder-md">
                {extraProps.description}
              </div>
            </div>
          );
      }
    case "cancel":
      switch (subType) {
        case "vote-to-cancel":
          return (
            <div
              onClick={() => {
                if (!isIndividual) {
                  router.push(`/quests/${extraProps.questId}`);
                }
              }}
              className={`${
                isIndividual ? "" : "hover:cursor-pointer"
              } flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-b  border-neutralBorder500`}
            >
              <div className="flex justify-start items-center w-full">
                <Alert height="32px" width="32px" />
                <div className="text-sm ml-1.5 text-neutral500 mr-2">
                  {`Client Voted To Cancel ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral200"></div>
                <div className="text-sm ml-2 text-neutral400 mr-auto">{`${time.fromNow()}`}</div>
              </div>
            </div>
          );
        case "cancel-escrow":
          return (
            <div
              onClick={() => {
                if (!isIndividual) {
                  router.push(`/quests/${extraProps.questId}`);
                }
              }}
              className={`${
                isIndividual ? "" : "hover:cursor-pointer"
              } flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-b  border-neutralBorder500`}
            >
              <div className="flex justify-start items-center w-full">
                <Alert height="32px" width="32px" />
                <div className="text-sm ml-1.5 text-neutral500 mr-2">
                  {`Client Cancelled ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral200"></div>
                <div className="text-sm ml-2 text-neutral400 mr-auto">{`${time.fromNow()}`}</div>
              </div>
            </div>
          );
        case "start-dispute":
          return (
            <div
              onClick={() => {
                if (!isIndividual) {
                  router.push(`/quests/${extraProps.questId}`);
                }
              }}
              className={`${
                isIndividual ? "" : "hover:cursor-pointer"
              } flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-b  border-neutralBorder500`}
            >
              <div className="flex justify-start items-center w-full">
                <Alert height="32px" width="32px" />
                <div className="text-sm ml-1.5 text-neutral500 mr-2">
                  {`Lancer Initiated Dispute for ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral200"></div>
                <div className="text-sm ml-2 text-neutral400 mr-auto">{`${time.fromNow()}`}</div>
              </div>
            </div>
          );
        case "settle-dispute":
          return (
            <div
              onClick={() => {
                if (!isIndividual) {
                  router.push(`/quests/${extraProps.questId}`);
                }
              }}
              className={`${
                isIndividual ? "" : "hover:cursor-pointer"
              } flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-b  border-neutralBorder500`}
            >
              <div className="flex justify-start items-center w-full">
                <Alert height="32px" width="32px" />
                <div className="text-sm ml-1.5 text-neutral500 mr-2">
                  {`Lancer Admin Settled the Dispute for ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral200"></div>
                <div className="text-sm ml-2 text-neutral400 mr-auto">{`${time.fromNow()}`}</div>
              </div>
            </div>
          );
      }

    case "application":
      switch (subType) {
        case "applied":
          return (
            <div
              onClick={() => {
                if (!isIndividual) {
                  router.push(`/quests/${extraProps.questId}`);
                }
              }}
              className={`${
                isIndividual ? "" : "hover:cursor-pointer"
              } flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-b  border-neutralBorder500`}
            >
              <div className="flex justify-start items-center w-full">
                <Mail height="32px" width="32px" version="blue" />
                <div className="text-sm ml-1.5 text-neutral500 mr-2">
                  {`New Application for ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral200"></div>
                <div className="text-sm ml-2 text-neutral400">{`${time.fromNow()}`}</div>
              </div>
            </div>
          );
        case "shortlisted":
          return (
            <div
              onClick={() => {
                if (!isIndividual) {
                  router.push(`/quests/${extraProps.questId}`);
                }
              }}
              className={`${
                isIndividual ? "" : "hover:cursor-pointer"
              } flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-b  border-neutralBorder500`}
            >
              <div className="flex justify-start items-center w-full">
                <Mail height="32px" width="32px" version="purple" />
                <div className="text-sm ml-1.5 text-neutral500 mr-2">
                  {`Shortlisted for ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral200"></div>
                <div className="text-sm ml-2 text-neutral400">{`${time.fromNow()}`}</div>
              </div>
            </div>
          );
        case "accepted":
          return (
            <div
              onClick={() => {
                if (!isIndividual) {
                  router.push(`/quests/${extraProps.questId}`);
                }
              }}
              className={`${
                isIndividual ? "" : "hover:cursor-pointer"
              } flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-b  border-neutralBorder500`}
            >
              <div className="flex justify-start items-center w-full">
                <Mail height="32px" width="32px" version="green" />
                <div className="text-sm ml-1.5 text-neutral500 mr-2">
                  {`Selected for ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral200"></div>
                <div className="text-sm ml-2 text-neutral400">{`${time.fromNow()}`}</div>
              </div>
            </div>
          );
        case "denied":
          return (
            <div
              onClick={() => {
                if (!isIndividual) {
                  router.push(`/quests/${extraProps.questId}`);
                }
              }}
              className={`${
                isIndividual ? "" : "hover:cursor-pointer"
              } flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-b  border-neutralBorder500`}
            >
              <div className="flex justify-start items-center w-full">
                <Mail height="32px" width="32px" version="orange" />
                <div className="text-sm ml-1.5 text-neutral500 mr-2">
                  {`Application Denied for ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral200"></div>
                <div className="text-sm ml-2 text-neutral400">{`${time.fromNow()}`}</div>
              </div>
            </div>
          );
        case "removed-shortlisted":
          return (
            <div
              onClick={() => {
                if (!isIndividual) {
                  router.push(`/quests/${extraProps.questId}`);
                }
              }}
              className={`${
                isIndividual ? "" : "hover:cursor-pointer"
              } flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-b  border-neutralBorder500`}
            >
              <div className="flex justify-start items-center w-full">
                <Mail height="32px" width="32px" version="orange" />
                <div className="text-sm ml-1.5 text-neutral500 mr-2">
                  {`Removed from Shortlist for ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral200"></div>
                <div className="text-sm ml-2 text-neutral400">{`${time.fromNow()}`}</div>
              </div>
            </div>
          );
      }
  }
};

export default UpdateTableItem;
