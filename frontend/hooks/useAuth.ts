"use client";

import { useEffect, useState } from "react";
import { getProfile } from "@/services/auth.service";
import { getToken, removeToken } from "@/lib/auth";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? getToken() : null;

    // ✅ No token → user is logged out → DO NOTHING
    if (!token) {
      setLoading(false);
      return;
    }

    getProfile()
      .then((response) => setUser(response.data))
      .catch(() => {
        removeToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return { user, loading };
};

