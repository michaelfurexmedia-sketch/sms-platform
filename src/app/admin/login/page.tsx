import { connection } from "next/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ownerPreviewAllowed } from "@/server/owner-preview";
import { brand } from "@/config/brand";
export default async function OwnerLogin() {
  await connection();
  if (!ownerPreviewAllowed(process.env)) notFound();
  return (
    <main className="foundation-home">
      <p className="eyebrow">Private owner application</p>
      <h1>{brand.name}</h1>
      <p>
        Local synthetic preview. Owner sign-in and mandatory multifactor
        authentication are not connected yet.
      </p>
      <p>
        Production access remains disabled until verified owner provisioning and
        server-side authorization are implemented in Phase 3.
      </p>
      <Link href="/admin/overview">Open local owner preview</Link>
    </main>
  );
}
