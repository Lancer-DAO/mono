import { User } from "@/types";
import dayjs, { Dayjs } from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { Flame, Message, ServiceBell } from "@/components";
dayjs.extend(relativeTime);
import { Image } from "lucide-react";

export type UpdateType = "submission" | "message" | "application";
export type SubmissionType =
  //   This submission was accepted
  | "accepted"
  //   This submission was rejected [second item in listed picture]
  | "rejected"
  //   This submission was requested changes
  | "changes"
  //   (client side) this quest has a new submission [third item in listed picture]
  | "new";
export type ApplicationType =
  //   (client side) A person sent an application
  | "applied"
  //   The person was accepted to the shortlist
  | "shortlisted"
  //   The person was at application stage but was rejected
  | "denied-application"
  //   The person was accepted to complete the quest
  | "accepted"
  //   The person was at shortlist stage but was rejected
  | "denied-shortlist";

type CommonProps = {
  time: Dayjs;
  updater: User;
};

type Props =
  | (CommonProps & { type: "submission"; subType: SubmissionType })
  | (CommonProps & { type: "application"; subType: ApplicationType })
  | (CommonProps & { type: "message"; subType?: never });

const UpdateTableItem: React.FC<Props> = ({ type, subType, updater, time }) => {
  switch (type) {
    case "submission":
      switch (subType) {
        case "new":
          return (
            <div className="flex flex-col px-8 py-4 items-start justify-center w-full border-solid border-y  border-neutralBorder500">
              <div className="flex justify-start items-center w-full">
                <ServiceBell height="28px" width="28px" />
                <div className="ml-1.5 text-neutral-500 mr-2">Review</div>
                <div className="h-5 w-[1px] bg-neutral-400"></div>
                <div className="ml-2 text-neutral-400">{`${time.fromNow()}`}</div>
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
                <Flame height="28px" width="28px" />
                <div className="ml-1.5 text-neutral-500 mr-2">
                  Wireframes for messaging
                </div>
                <div className="h-5 w-[1px] bg-neutral-400"></div>
                <div className="ml-2 text-neutral-400 mr-auto">{`${time.fromNow()}`}</div>
                <div className="ml-auto text-warning">Rejected</div>
              </div>
              <div className="mt-4 rounded-md text-xs leading-normal text-neutral-500 border border-neutralBorder-200 py-2.5 px-3.5 bg-neutral-100 w-full rounder-md">
                Not sure about the colors because it doesn’t match our brand
                identity. I forgot to give you the real logo in black & white.
                Can you incorporate this before we move to the polishing part ?
              </div>
            </div>
          );
      }

    case "message":
      return (
        <div className="flex px-8 py-4 items-center justify-start w-full border-solid border-y bg-primary100 border-neutralBorder500">
          <Message height="28px" width="28px" />
          <div className="ml-1.5 text-black mr-4">{`New message from ${updater.name}`}</div>
          <div className=" text-neutral400 mr-4">{`${time.fromNow()}`}</div>
        </div>
      );

    case "application":
      return <></>;
  }
};

export default UpdateTableItem;
