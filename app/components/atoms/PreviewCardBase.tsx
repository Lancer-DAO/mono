import { FC } from "react";

interface Props {
  title?: string;
  width?: string;
  align?: "center" | "start" | "end";
  children: React.ReactNode;
}

const PreviewCardBase: FC<Props> = ({
  title,
  children,
  width = "355px",
  align = "center",
}) => {
  return (
    <div className="flex flex-col gap-3">
      {title && <h1 className="text-2xl font-bold text-center">{title}</h1>}
      <div
        className="border-[3px] border-neutralBtnBorder rounded-xl
        flex items-center justify-center p-2"
        style={{
          width: width,
          height: width,
          alignItems: `${align === "center" ? "center" : `align-${align}`}`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default PreviewCardBase;
