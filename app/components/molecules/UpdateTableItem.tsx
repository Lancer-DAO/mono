import { User } from "@/types";
import dayjs, { Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Alert, Button, Flame, Mail, Message, ServiceBell } from "@/components";
dayjs.extend(relativeTime);
import { Image } from "lucide-react";

import { motion } from "framer-motion";
import { smallClickAnimation } from "@/src/constants";
export type UpdateType = "submission" | "message" | "application" | "quote";
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
export type QuoteType =
  //   (client side) A person sent an application
  | "received"
  //   The person was accepted to the shortlist
  | "rejected"
  //   The person was at application stage but was rejected
  | "accepted";

export const getApplicationTypeFromLabel = (label: string): ApplicationType => {
  switch (label) {
    case "add-to-shortlist":
      return "shortlisted";

    case "select":
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
      };
    })
  | (CommonProps & {
      type: "application";
      subType: ApplicationType;
      extraProps: {
        questName: string;
      };
    })
  | (CommonProps & { type: "quote"; subType: QuoteType; updater: User })
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
  switch (type) {
    case "submission":
      switch (subType) {
        case "new":
          return (
            <div className="flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500">
              <div className="flex justify-start items-center w-full">
                <ServiceBell height="28px" width="28px" />
                <div className="text-sm ml-1.5 text-neutral-500 mr-2">
                  Review
                </div>
                <div className="h-5 w-[1px] bg-neutral-200"></div>
                <div className="text-sm ml-2 text-neutral-400">{`${time.fromNow()}`}</div>
                <div className="ml-auto flex items-center justify-end text text-neutral600">
                  <button
                    className="rounded-md bg-white border border-neutral200 flex items-center justify-center gap-2 h-8 px-2"
                    // disabled={hasApplied}
                    onClick={() => {}}
                  >
                    <Image color="#A1B2AD" size={18} />
                    <p className="text-xs text-neutral400 truncate">
                      resume.pdf
                    </p>
                  </button>
                </div>
              </div>
              <div className="mt-4 rounded-md text-xs leading-normal text-neutral-500 border border-neutralBorder-200 py-2.5 px-3.5 bg-neutral-100 w-full rounder-md">
                Not sure about the colors because it doesn’t match our brand
                identity. I forgot to give you the real logo in black & white.
                Can you incorporate this before we move to the polishing part ?
              </div>
            </div>
          );
        case "rejected":
          return (
            <div className="flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500">
              <div className="flex justify-start items-center w-full">
                <Flame height="28px" width="28px" version="orange" />
                <div className="text-sm ml-1.5 text-neutral-500 mr-2">
                  Review Received
                </div>
                <div className="h-5 w-[1px] bg-neutral-200"></div>
                <div className="text-sm ml-2 text-neutral-400 mr-auto">{`${time.fromNow()}`}</div>
                <div className="text-sm ml-auto text-warning">Rejected</div>
              </div>
              <div className="mt-4 rounded-md text-xs leading-normal text-neutral-500 border border-neutralBorder-200 py-2.5 px-3.5 bg-neutral-100 w-full rounder-md">
                Not sure about the colors because it doesn’t match our brand
                identity. I forgot to give you the real logo in black & white.
                Can you incorporate this before we move to the polishing part ?
              </div>
            </div>
          );
        case "accepted":
          return (
            <div className="flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500">
              <div className="flex justify-start items-center w-full">
                <Flame height="28px" width="28px" version="green" />
                <div className="text-sm ml-1.5 text-neutral-500 mr-2">
                  Review Received
                </div>
                <div className="h-5 w-[1px] bg-neutral-200"></div>
                <div className="text-sm ml-2 text-neutral-400 mr-auto">{`${time.fromNow()}`}</div>
                <div className="text-sm ml-auto text-success">Accepted</div>
              </div>
              <div className="mt-4 rounded-md text-xs leading-normal text-neutral-500 border border-neutralBorder-200 py-2.5 px-3.5 bg-neutral-100 w-full rounder-md">
                Not sure about the colors because it doesn’t match our brand
                identity. I forgot to give you the real logo in black & white.
                Can you incorporate this before we move to the polishing part ?
              </div>
            </div>
          );

        case "vote-to-cancel":
          return (
            <div className="flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500">
              <div className="flex justify-start items-center w-full">
                <Alert height="28px" width="28px" />
                <div className="text-sm ml-1.5 text-warning mr-2">
                  {`Client Voted To Cancel ${extraProps.questName}`}
                </div>
                <div className="h-5 w-[1px] bg-neutral-200"></div>
                <div className="text-sm ml-2 text-neutral-400 mr-auto">{`${time.fromNow()}`}</div>
                <motion.button
                  {...smallClickAnimation}
                  className="text-sm bg-white border border-neutral300 h-9 w-fit px-4 py-2
                title-text rounded-md text-neutral60 mr-2"
                >
                  Dispute
                </motion.button>
                <motion.button
                  {...smallClickAnimation}
                  className="text-sm bg-secondary200 h-9 w-fit px-4 py-2
                title-text rounded-md text-white disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {`Confirm Cancel`}
                </motion.button>
              </div>
            </div>
          );
      }
    case "quote":
      switch (subType) {
        case "received":
          return (
            <div className="flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500">
              <div className="flex justify-start items-center w-full">
                <Flame height="28px" width="28px" version="purple" />
                <div className="text-sm ml-1.5 text-neutral-500 mr-2">
                  Quote Received
                </div>
                <div className="h-5 w-[1px] bg-neutral-200"></div>
                <div className="text-sm ml-2 text-neutral-400">{`${time.fromNow()}`}</div>
                <div className="ml-auto flex items-center justify-end text text-neutral600">
                  <button
                    className="rounded-md bg-white border border-neutral200 flex items-center justify-center gap-2 h-8 px-2"
                    // disabled={hasApplied}
                    onClick={() => {}}
                  >
                    <Image color="#A1B2AD" size={18} />
                    <p className="text-xs text-neutral400 truncate">
                      quote.pdf
                    </p>
                  </button>
                </div>
              </div>
            </div>
          );
        case "rejected":
          return (
            <div className="flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500">
              <div className="flex justify-start items-center w-full">
                <Flame height="28px" width="28px" version="orange" />
                <div className="text-sm ml-1.5 text-neutral-500 mr-2">
                  Quote Rejected
                </div>
                <div className="h-5 w-[1px] bg-neutral-200"></div>
                <div className="text-sm ml-2 text-neutral-400 mr-auto">{`${time.fromNow()}`}</div>
                <div className="ml-auto flex items-center justify-end text text-neutral600">
                  <button
                    className="rounded-md bg-white border border-neutral200 flex items-center justify-center gap-2 h-8 px-2"
                    // disabled={hasApplied}
                    onClick={() => {}}
                  >
                    <Image color="#A1B2AD" size={18} />
                    <p className="text-xs text-neutral400 truncate">
                      quote.pdf
                    </p>
                  </button>
                </div>
                <div className="text-sm ml-2 text-warning">Rejected</div>
              </div>
            </div>
          );
        case "accepted":
          return (
            <div className="flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500">
              <div className="flex justify-start items-center w-full">
                <Flame height="28px" width="28px" version="green" />
                <div className="text-sm ml-1.5 text-neutral-500 mr-2">
                  Quote Accepted
                </div>
                <div className="h-5 w-[1px] bg-neutral-200"></div>
                <div className="text-sm ml-2 text-neutral-400 mr-auto">{`${time.fromNow()}`}</div>
                <div className="ml-auto flex items-center justify-end text text-neutral600">
                  <button
                    className="rounded-md bg-white border border-neutral200 flex items-center justify-center gap-2 h-8 px-2"
                    // disabled={hasApplied}
                    onClick={() => {}}
                  >
                    <Image color="#A1B2AD" size={18} />
                    <p className="text-xs text-neutral400 truncate">
                      quote.pdf
                    </p>
                  </button>
                </div>
                <div className="text-sm ml-2 text-success">Accepted</div>
              </div>
            </div>
          );
      }

    case "application":
      switch (subType) {
        case "applied":
          return (
            <div className="flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500">
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
            <div className="flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500">
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
            <div className="flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500">
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
            <div className="flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500">
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
            <div className="flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500">
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

    case "application":
      return <></>;
  }
};

export default UpdateTableItem;
