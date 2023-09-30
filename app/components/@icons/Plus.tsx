import { FC, SVGAttributes } from "react";

export interface PlusProps extends SVGAttributes<SVGSVGElement> {}

const Plus: FC<PlusProps> = ({ ...componentProps }: PlusProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
  >
    <path
      d="M8 3.3335V12.6668"
      stroke="#14BB88"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.33337 8H12.6667"
      stroke="#14BB88"
      strokeWidth="1.33333"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Plus;
