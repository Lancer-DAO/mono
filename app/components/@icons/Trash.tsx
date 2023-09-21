import { FC, SVGAttributes } from "react";

export interface TrashProps extends SVGAttributes<SVGSVGElement> {}

const Trash: FC<TrashProps> = ({ ...componentProps }: TrashProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M1.5 3H10.5" stroke="#A1B3AD" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9.5 3V10C9.5 10.5 9 11 8.5 11H3.5C3 11 2.5 10.5 2.5 10V3" stroke="#A1B3AD" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M4 3V2C4 1.5 4.5 1 5 1H7C7.5 1 8 1.5 8 2V3" stroke="#A1B3AD" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M5 5.5V8.5" stroke="#A1B3AD" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7 5.5V8.5" stroke="#A1B3AD" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
);

export default Trash;
