import { useEffect, useState } from "react";
import {isAccessTokenValid} from "../api/authApi.ts";

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const valid = await isAccessTokenValid();

        if (valid) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }

        setLoading(false);
      } catch (err) {
        console.warn("Auth check failed:", err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, []);

  return { isAuthenticated, loading };
};