import { FC } from "react";

interface TProps {
  text: string;
}

const Tooltip: FC<TProps> = ({ text }) => {
  return (
    <div
      className="absolute left-1/2 transform -translate-x-1/2 w-[150px] h-full
      -translate-y-[300%] shadow-lg opacity-0 group-hover:opacity-100
      transition-opacity duration-200 ease-in-out z-50"
    >
      <p className="text-black bg-white text-sm p-2 rounded-md">{text}</p>
    </div>
  );
};

export default Tooltip;
