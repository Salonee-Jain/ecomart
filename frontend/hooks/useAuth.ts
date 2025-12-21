"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/services/auth.service";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    // ✅ No token → user is logged out → DO NOTHING
    if (!token) {
      setLoading(false);
      return;
    }

    getProfile()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem("token");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
};

