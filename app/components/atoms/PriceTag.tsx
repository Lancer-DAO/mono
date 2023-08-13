import { FC } from "react";
import { USDC } from "@/components";
import { Decimal } from "@prisma/client/runtime";

interface Props {
  price: Decimal | number;
}

const formatPrice = (price: Decimal | number) => {
  if (price.toString().length > 5) {
    return `${new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
    }).format(Number(price))}`;
  } else {
    return price.toLocaleString();
  }
};

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
