import Image from "next/image";
import { FC } from "react";

interface Props {
  type: "positive" | "negative" | "neutral";
  title: string;
  description: string;
  icon?: string;
}

const AlertCard: FC<Props> = ({
  type,
  title,
  description,
  icon = "/assets/icons/rocket.svg",
}) => {
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
        {icon && (
          <div className="absolute top-0 -left-8">
            <Image src={icon} width={24} height={24} alt="icon" />
          </div>
        )}
      </div>
      <p className="text">{description}</p>
    </div>
  );
};

export default AlertCard;
