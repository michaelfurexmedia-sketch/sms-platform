import Link from "next/link";
import { brand } from "@/config/brand";
export default function Home() {
  return <><a className="skip-link" href="#main">Skip to content</a><main id="main" className="foundation-home">
    <p className="eyebrow">{brand.wordmark} / Foundation 01</p>
    <h1>A clear starting point.</h1>
    <p className="intro">The design and engineering foundation for thoughtful business messaging. This development build contains shared components and infrastructure checks. Customer and administrator workflows arrive in later phases.</p>
    <Link href="/design-system">Explore the component library →</Link>
  </main></>;
}
