import { Suspense } from "react";
import Admin from "@/components/Admin";

export default function AdminPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Admin />
    </Suspense>
  );
}