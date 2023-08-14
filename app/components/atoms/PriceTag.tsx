import { FC } from "react";
import { USDC } from "@/components";
import { Decimal } from "@prisma/client/runtime";

interface Props {
  price: Decimal | number;
}

const PriceTag: FC<Props> = ({ price }) => {
  const formatPrice = (price: Decimal | number) => {
    if (price?.toString().length > 5) {
      return `${new Intl.NumberFormat("en-US", {
        notation: "compact",
        compactDisplay: "short",
      }).format(Number(price))}`;
    } else {
      return price?.toLocaleString();
    }
  };

  if (!price) return <div className="h-[28px]" />;

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
