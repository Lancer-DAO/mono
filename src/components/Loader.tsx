import { Oval } from "react-loader-spinner";

interface LoaderProps {
  height: number;
  width: number;
  color: string;
  strokeWidth: number;
}

export const Loader = ({ height, width, color, strokeWidth }: LoaderProps) => {
  return (
    <Oval
      ariaLabel="loading-indicator"
      height={height}
      width={width}
      strokeWidth={strokeWidth}
      color={color}
      secondaryColor="grey"
    />
  );
};
