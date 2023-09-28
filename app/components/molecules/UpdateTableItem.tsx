import { User } from "@/types";
import dayjs, { Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Alert, Button, Flame, Mail, Message, ServiceBell } from "@/components";
dayjs.extend(relativeTime);
import { Image } from "lucide-react";

import { motion } from "framer-motion";
import { smallClickAnimation } from "@/src/constants";
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
  | "cancel-escrow";

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
}) => {
  const router = useRouter();
  switch (type) {
    case "message":
      return (
        <div className="flex px-8 py-4 items-center justify-start w-full border-solid border-y bg-primary100 border-neutralBorder500">
          <Message height="28px" width="28px" />
          <div className="text-sm ml-1.5 text-black mr-4">{`${
            extraProps.messageCount
          } New message${extraProps.messageCount > 1 ? "s" : ""} from ${
            extraProps.updater
          }`}</div>
          <div className="text-sm  text-neutral400 mr-4">{`${time.fromNow()}`}</div>
        </div>
      );
    case "submission":
      switch (subType) {
        case "new":
          return (
            <div
              onClick={() => {
                router.push(`/quests/${extraProps.questId}`);
              }}
              className="flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500 hover:cursor-pointer"
            >
              <div className="flex justify-start items-center w-full">
                <ServiceBell height="28px" width="28px" />
                <div className="text-sm ml-1.5 text-neutral-500 mr-2">
                  {`New Update for ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral-200"></div>
                <div className="text-sm ml-2 text-neutral-400">{`${time.fromNow()}`}</div>
                <div className="ml-auto flex items-center justify-end text text-neutral600"></div>
              </div>
              <div className="mt-4 rounded-md text-xs leading-normal text-neutral-500 border border-neutralBorder-200 py-2.5 px-3.5 bg-neutral-100 w-full rounder-md">
                {extraProps.description}
              </div>
            </div>
          );
        case "rejected":
          return (
            <div
              onClick={() => {
                router.push(`/quests/${extraProps.questId}`);
              }}
              className="hover:cursor-pointer flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500"
            >
              <div className="flex justify-start items-center w-full">
                <Flame height="28px" width="28px" version="orange" />
                <div className="text-sm ml-1.5 text-neutral-500 mr-2">
                  {`Review for ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral-200"></div>
                <div className="text-sm ml-2 text-neutral-400 mr-auto">{`${time.fromNow()}`}</div>
                <div className="text-sm ml-auto text-warning">Rejected</div>
              </div>
              <div className="mt-4 rounded-md text-xs leading-normal text-neutral-500 border border-neutralBorder-200 py-2.5 px-3.5 bg-neutral-100 w-full rounder-md">
                {extraProps.description}
              </div>
            </div>
          );
        case "accepted":
          return (
            <div
              onClick={() => {
                router.push(`/quests/${extraProps.questId}`);
              }}
              className="hover:cursor-pointer flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500"
            >
              <div className="flex justify-start items-center w-full">
                <Flame height="28px" width="28px" version="green" />
                <div className="text-sm ml-1.5 text-neutral-500 mr-2">
                  {`Review for ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral-200"></div>
                <div className="text-sm ml-2 text-neutral-400 mr-auto">{`${time.fromNow()}`}</div>
                <div className="text-sm ml-auto text-success">Accepted</div>
              </div>
              <div className="mt-4 rounded-md text-xs leading-normal text-neutral-500 border border-neutralBorder-200 py-2.5 px-3.5 bg-neutral-100 w-full rounder-md">
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
                router.push(`/quests/${extraProps.questId}`);
              }}
              className="hover:cursor-pointer flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500"
            >
              <div className="flex justify-start items-center w-full">
                <Alert height="28px" width="28px" />
                <div className="text-sm ml-1.5 text-warning mr-2">
                  {`Client Voted To Cancel ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral-200"></div>
                <div className="text-sm ml-2 text-neutral-400 mr-auto">{`${time.fromNow()}`}</div>
              </div>
            </div>
          );
        case "cancel-escrow":
          return (
            <div
              onClick={() => {
                router.push(`/quests/${extraProps.questId}`);
              }}
              className="hover:cursor-pointer flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500"
            >
              <div className="flex justify-start items-center w-full">
                <Alert height="28px" width="28px" />
                <div className="text-sm ml-1.5 text-warning mr-2">
                  {`Client Cancelled ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral-200"></div>
                <div className="text-sm ml-2 text-neutral-400 mr-auto">{`${time.fromNow()}`}</div>
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
                router.push(`/quests/${extraProps.questId}`);
              }}
              className="hover:cursor-pointer flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500"
            >
              <div className="flex justify-start items-center w-full">
                <Mail height="28px" width="28px" version="blue" />
                <div className="text-sm ml-1.5 text-neutral-500 mr-2">
                  {`New Application for ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral-200"></div>
                <div className="text-sm ml-2 text-neutral-400">{`${time.fromNow()}`}</div>
              </div>
            </div>
          );
        case "shortlisted":
          return (
            <div
              onClick={() => {
                router.push(`/quests/${extraProps.questId}`);
              }}
              className="hover:cursor-pointer flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500"
            >
              <div className="flex justify-start items-center w-full">
                <Mail height="28px" width="28px" version="purple" />
                <div className="text-sm ml-1.5 text-neutral-500 mr-2">
                  {`Shortlisted for ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral-200"></div>
                <div className="text-sm ml-2 text-neutral-400">{`${time.fromNow()}`}</div>
              </div>
            </div>
          );
        case "accepted":
          return (
            <div
              onClick={() => {
                router.push(`/quests/${extraProps.questId}`);
              }}
              className="hover:cursor-pointer flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500"
            >
              <div className="flex justify-start items-center w-full">
                <Mail height="28px" width="28px" version="green" />
                <div className="text-sm ml-1.5 text-success mr-2">
                  {`Selected for ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral-200"></div>
                <div className="text-sm ml-2 text-neutral-400">{`${time.fromNow()}`}</div>
              </div>
            </div>
          );
        case "denied":
          return (
            <div
              onClick={() => {
                router.push(`/quests/${extraProps.questId}`);
              }}
              className="hover:cursor-pointer flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500"
            >
              <div className="flex justify-start items-center w-full">
                <Mail height="28px" width="28px" version="orange" />
                <div className="text-sm ml-1.5 text-warning mr-2">
                  {`Application Denied for ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral-200"></div>
                <div className="text-sm ml-2 text-neutral-400">{`${time.fromNow()}`}</div>
              </div>
            </div>
          );
        case "removed-shortlisted":
          return (
            <div
              onClick={() => {
                router.push(`/quests/${extraProps.questId}`);
              }}
              className="hover:cursor-pointer flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500"
            >
              <div className="flex justify-start items-center w-full">
                <Mail height="28px" width="28px" version="orange" />
                <div className="text-sm ml-1.5 text-warning mr-2">
                  {`Removed from Shortlist for ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral-200"></div>
                <div className="text-sm ml-2 text-neutral-400">{`${time.fromNow()}`}</div>
              </div>
            </div>
          );
      }
  }
};

export default UpdateTableItem;
