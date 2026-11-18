import { formatPrice } from "@/lib/format";

export function Price({ price, compareAt, size = "md" }: { price: number; compareAt?: number | null; size?: "sm" | "md" | "lg" }) {
  const sale = compareAt != null && compareAt > price;
  const big = size === "lg" ? "text-[30px] md:text-[36px]" : size === "sm" ? "text-[15px]" : "text-[17px]";
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-2.5">
      <span className={`font-display font-bold tracking-wide ${big} ${sale ? "text-cherry" : ""}`}>{formatPrice(price)}</span>
      {sale && <s className={`text-mute ${size === "lg" ? "text-[17px]" : "text-[13px]"}`}>{formatPrice(compareAt!)}</s>}
    </span>
  );
}
