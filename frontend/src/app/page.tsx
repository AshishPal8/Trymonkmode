import { Suspense } from "react";
import { LandingEntry } from "@/components/landing/LandingEntry";

/** Public home page. The signed-in app lives at /app. */
export default function HomePage() {
  return (
    <Suspense>
      <LandingEntry />
    </Suspense>
  );
}
