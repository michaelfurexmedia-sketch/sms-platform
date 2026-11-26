import { brand as publicBrand } from "../config/brand";
export const brand = {
  ...publicBrand,
  storageKey: "sms-platform-demo-v1",
  demoCode: "246810",
};
export type Pricing = {
  numberFee: number;
  packs: { credits: number; cents: number }[];
  plans: { name: string; cents: number; credits: number; published: boolean }[];
};
export const defaultPricing: Pricing = {
  numberFee: 1000,
  packs: [
    [500, 775],
    [1000, 1500],
    [1500, 2235],
    [2000, 2960],
    [2500, 3675],
    [3000, 4380],
    [4000, 5800],
    [5000, 7200],
    [6000, 8580],
    [7500, 10650],
    [9000, 12690],
    [10000, 14000],
  ].map(([credits, cents]) => ({ credits, cents })),
  plans: [],
};
export const money = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    cents / 100,
  );
export const count = (n: number) => n.toLocaleString("en-US");
export const date = (value?: string) =>
  value
    ? new Date(value).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";
