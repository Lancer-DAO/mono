import { FC } from "react";

interface Props {
  title?: string;
  children: React.ReactNode;
}

const PreviewCardBase: FC<Props> = ({ title, children }) => {
  return (
    <div className="flex flex-col items-center gap-3">
      {title && <h1 className="text-2xl font-bold text-center">{title}</h1>}
      <div
        className="w-[355px] h-[357px] border-[3px] border-neutralBtnBorder rounded-xl
      flex items-center justify-center p-2"
      >
        {children}
      </div>
    </div>
  );
};

export default PreviewCardBase;
