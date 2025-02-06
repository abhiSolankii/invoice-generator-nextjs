"use client";

import { useRouter } from "next/navigation";
import { useEffect, ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "@/context/AuthContext";

interface ProtectRouteProps {
  children: ReactNode;
}

interface DecodedToken {
  exp: number;
}

const ProtectRoute: React.FC<ProtectRouteProps> = ({ children }) => {
  const { user, token, logOut } = useAuth();
  const router = useRouter();
  //   console.log(user, token);

  useEffect(() => {
    if (!user || !token) {
      //   logOut(); // Ensure cleanup if either is missing
      //   router.replace("/login");
      return;
    }

    try {
      const decoded: DecodedToken = jwtDecode(token);
      const isExpired = decoded.exp * 1000 < Date.now(); // Convert exp to milliseconds
      //   console.log(decoded.exp);

      if (isExpired) {
        // logOut();
        // router.replace("/login");
      }
    } catch (error) {
      console.error("Invalid token:", error);
      logOut();
      //   router.replace("/login");
    }
  }, [user, token, logOut, router]);

  return <>{children}</>;
};

export default ProtectRoute;
