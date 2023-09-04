import { FC, HTMLAttributes } from "react";

interface TProps extends HTMLAttributes<HTMLDivElement> {
  text: string;
}

const Tooltip: FC<TProps> = ({ text }) => {
  return (
    <div
      className="absolute w-[150px] h-full opacity-0 
      group-hover:opacity-100 transition-opacity 
      duration-200 ease-in-out z-50"
    >
      <p className="text-black bg-white text-sm p-2 rounded-md shadow-lg">
        {text}
      </p>
    </div>
  );
};

export default Tooltip;
