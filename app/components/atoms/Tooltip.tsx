import { FC, HTMLAttributes } from "react";

interface TProps extends HTMLAttributes<HTMLDivElement> {
  text: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  oneLine?: boolean;
}

const Tooltip: FC<TProps> = ({
  text,
  top,
  right,
  bottom,
  left,
  oneLine = false,
}) => {
  return (
    <div
      className={`absolute ${
        oneLine ? "whitespace-nowrap w-fit" : "w-[150px]"
      } h-full opacity-0 pointer-events-none
      group-hover:opacity-100 transition-opacity 
      duration-200 ease-in-out z-50`}
      style={{ top: top, right: right, bottom: bottom, left: left }}
    >
      <p className="text-black bg-white text-sm p-2 rounded-md shadow-lg">
        {text}
      </p>
    </div>
  );
};

export default Tooltip;
