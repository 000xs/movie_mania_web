// hooks/useAuth.js
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useAuth() {
  const router = useRouter();

  useEffect(() => {
    // quick client-side check (optional)
    fetch("/api/protected")
      .then((r) => {
        if (!r.ok) router.push("/admin/login");
      })
      .catch(() => router.push("/admin/login"));
  }, [router]);
}
