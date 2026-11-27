// Preview availability only. This is not owner authentication or authorization.
export function ownerPreviewAllowed(env: Record<string, string | undefined>) {
  return (
    env.OWNER_PREVIEW === "local-only" &&
    env.APP_HOST === "127.0.0.1" &&
    !env.SITES_MANAGED_LINUX_CONTAINER
  );
}
