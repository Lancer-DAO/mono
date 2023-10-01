import { Rocket } from "@/components";
import { FC } from "react";

interface Props {
  type: "positive" | "negative" | "neutral";
  title: string;
  description: string;
  children?: React.ReactNode;
}

const AlertCard: FC<Props> = ({ type, title, description, children }) => {
  return (
    <div
      className={`w-full mx-auto rounded-md p-4 pl-12 flex flex-col justify-evenly
    ${
      type === "positive"
        ? "bg-successBg text-[#6BB274]"
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
                  ? "#6BB274"
                  : type === "negative"
                  ? "#F5364F"
                  : "#73807C",
            }}
          />
        </div>
      </div>
      <p className="text">{description}</p>
      {children}
    </div>
  );
};

export default AlertCard;
