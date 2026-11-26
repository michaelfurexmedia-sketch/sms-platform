import { customerRoutes, adminRoutes } from "@/frontend/routes";
import Application from "@/legacy/application";
import { brandVariables } from "@/config/brand";
import "@/legacy/styles.css";
export function generateStaticParams() {
  return [
    [],
    ["features"],
    ["pricing"],
    ["signup"],
    ["login"],
    ["app"],
    ...customerRoutes.map((s) => ["app", s]),
    ["admin"],
    ...adminRoutes.map((s) => ["admin", s]),
  ].map((slug) => ({ slug }));
}
export const dynamicParams = false;
export default function Page() {
  return (
    <div className="legacy-app" style={brandVariables("light")}>
      <Application />
    </div>
  );
}
