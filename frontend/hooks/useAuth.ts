import { useState, useEffect } from "react";
import { getProfile } from "@/services/auth.service";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getProfile()
      .then(res => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  return { user };
};
