import { Rocket } from "@/components";
import Image from "next/image";
import { FC } from "react";

interface Props {
  type: "positive" | "negative" | "neutral";
  title: string;
  description: string;
}

const AlertCard: FC<Props> = ({ type, title, description }) => {
  return (
    <div
      className={`w-[92%] mx-auto rounded-md p-4 pl-12 mt-4 flex flex-col justify-evenly
    ${
      type === "positive"
        ? "bg-successBg text-[#10966D]"
        : type === "negative"
        ? "bg-errorBg text-error"
        : "bg-neutral100 text-neutral-500"
    }`}
    >
      <div className="relative w-full">
        <p className="title-text">{title}</p>
        <div className="absolute top-0 -left-8">
          <Rocket
            width={24}
            style={{
              stroke:
                type === "positive"
                  ? "#10966D"
                  : type === "negative"
                  ? "#F5364F"
                  : "#73807C",
            }}
          />
        </div>
      </div>
      <p className="text">{description}</p>
    </div>
  );
};

export default AlertCard;
