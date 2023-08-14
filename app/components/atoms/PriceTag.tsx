import { FC } from "react";
import { USDC } from "@/components";
import { Decimal } from "@prisma/client/runtime";
import { formatPrice } from "@/utils";

interface Props {
  price: Decimal | number;
}

const PriceTag: FC<Props> = ({ price }) => {
  return (
    <div className="bg-white rounded-full border border-textPrimary h-[28px] flex items-center gap-2 px-0.5">
      <USDC height="22px" width="22px" />
      <p className="pr-2 font-bold text-industryGreenBorder">{`$${formatPrice(
        price
      )}`}</p>
    </div>
  );
};

export default PriceTag;
