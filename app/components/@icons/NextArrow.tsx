import { FC, SVGAttributes } from "react";

export interface NextArrowProps extends SVGAttributes<SVGSVGElement> {}

const NextArrow: FC<NextArrowProps> = ({
  ...componentProps
}: NextArrowProps) => (
  <svg
    width="19"
    height="34"
    {...componentProps}
    viewBox="0 0 19 34"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M1 1L17 17L1 33" stroke="#DADADA" stroke-width="2.5" />
  </svg>
);

export default NextArrow;
