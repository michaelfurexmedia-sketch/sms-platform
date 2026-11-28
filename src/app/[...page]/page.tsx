import { notFound } from "next/navigation";
import { Marketing } from "@/frontend/marketing";
import { publicSlugs } from "@/frontend/content";
import "@/legacy/styles.css";
import "@/frontend/marketing.css";
export function generateStaticParams() {
  return publicSlugs.map((page) => ({ page: [page] }));
}
export const dynamicParams = false;
export default async function Page({
  params,
}: {
  params: Promise<{ page: string[] }>;
}) {
  const { page } = await params;
  if (page.length !== 1 || !publicSlugs.includes(page[0])) notFound();
  return <Marketing page={page[0]} />;
}
