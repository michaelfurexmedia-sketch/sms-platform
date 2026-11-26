"use client";
import NextLink from "next/link";
import {
  usePathname as useNextPathname,
  useRouter as useNextRouter,
} from "next/navigation";
import type { ComponentProps } from "react";
export { useSearchParams } from "next/navigation";
function previewPath(path: string, preview = true) {
  return preview &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.startsWith("/preview")
    ? "/preview" + path
    : path;
}
export default function Link({
  href,
  ...props
}: ComponentProps<typeof NextLink>) {
  const preview = useNextPathname().startsWith("/preview");
  const target =
    typeof href === "string"
      ? previewPath(href, preview)
      : {
          ...href,
          pathname: href.pathname
            ? previewPath(href.pathname, preview)
            : href.pathname,
        };
  return <NextLink {...props} href={target} />;
}
export function usePathname() {
  const path = useNextPathname().replace(/^\/preview(?=\/|$)/, "") || "/";
  return path.endsWith("/") ? path : path + "/";
}
export function useRouter() {
  const router = useNextRouter();
  const preview = useNextPathname().startsWith("/preview");
  return {
    ...router,
    push: (...[path, options]: Parameters<typeof router.push>) =>
      router.push(previewPath(path, preview), options),
    replace: (...[path, options]: Parameters<typeof router.replace>) =>
      router.replace(previewPath(path, preview), options),
  };
}
