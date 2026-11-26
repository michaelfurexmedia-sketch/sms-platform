import Application from "@/components/application";
export function generateStaticParams() {
  return [
    [],
    ["features"],
    ["pricing"],
    ["signup"],
    ["login"],
    ["app"],
    ...["inbox", "contacts", "campaigns", "numbers", "team", "billing"].map(
      (s) => ["app", s],
    ),
    ["admin"],
    ...[
      "overview",
      "users",
      "verification",
      "numbers",
      "payments",
      "settings",
    ].map((s) => ["admin", s]),
  ].map((slug) => ({ slug }));
}
export const dynamicParams = false;
export default function Page() {
  return <Application />;
}
