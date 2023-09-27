import { FC, SVGAttributes } from "react";

export interface RocketProps extends SVGAttributes<SVGSVGElement> {}

const Rocket: FC<RocketProps> = ({ ...componentProps }: RocketProps) => (
  <svg
    width="25"
    height="24"
    {...componentProps}
    viewBox="0 0 25 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M5.1001 16.5003C3.6001 17.7603 3.1001 21.5003 3.1001 21.5003C3.1001 21.5003 6.8401 21.0003 8.1001 19.5003C8.8101 18.6603 8.8001 17.3703 8.0101 16.5903C7.6214 16.2193 7.10939 16.005 6.57232 15.9883C6.03526 15.9717 5.51097 16.1541 5.1001 16.5003Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.6001 15.0002L9.6001 12.0002C10.1322 10.6197 10.8023 9.29631 11.6001 8.05025C12.7653 6.18723 14.3877 4.6533 16.3131 3.59434C18.2385 2.53538 20.4028 1.98662 22.6001 2.00025C22.6001 4.72025 21.8201 9.50025 16.6001 13.0002C15.337 13.799 13.9969 14.469 12.6001 15.0002Z"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.6001 11.9995H4.6001C4.6001 11.9995 5.1501 8.96953 6.6001 7.99953C8.2201 6.91953 11.6001 7.99953 11.6001 7.99953"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M12.6001 15V20C12.6001 20 15.6301 19.45 16.6001 18C17.6801 16.38 16.6001 13 16.6001 13"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Rocket;
