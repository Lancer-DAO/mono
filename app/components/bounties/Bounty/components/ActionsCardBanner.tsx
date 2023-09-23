import { FC } from "react";

interface Props {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

const ActionsCardBanner: FC<Props> = ({ title, subtitle, children }) => {
  return (
    <div className="w-full flex flex-col">
      {/* banner */}
      <div className="w-full h-[68px] bg-secondary300 flex items-center justify-between px-6">
        <div className="flex flex-col gap-1">
          <p className="title-text text-white">{title}</p>
          {subtitle && <p className="text text-neutral400">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
};

export default ActionsCardBanner;
