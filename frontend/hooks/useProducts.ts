"use client";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({ children }: any) {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    router.push("/login");
    return null;
  }

  return children;
}
