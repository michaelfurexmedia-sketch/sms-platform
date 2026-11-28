import { notFound } from "next/navigation";
import { customerRoutes as routes } from "@/frontend/routes";
import Application from "@/legacy/application";
import { brandVariables } from "@/config/brand";
import "@/legacy/styles.css";
export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  if (slug.length > 1 || (slug.length && !routes.includes(slug[0]))) notFound();
  return (
    <div className="legacy-app" style={brandVariables("light")}>
      <Application />
    </div>
  );
}
