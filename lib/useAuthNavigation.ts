"use client";

import { useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";

export function useAuthNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navigate = useCallback(
    (path: string) => {
      if (pathname === path) return;
      router.replace(path);
    },
    [router, pathname]
  );

  const navigateToSignIn = useCallback(() => {
    navigate("/sign-in");
  }, [navigate]);

  const navigateToSignUp = useCallback(() => {
    navigate("/sign-up");
  }, [navigate]);

  const navigateToResetPassword = useCallback(() => {
    navigate("/reset-password");
  }, [navigate]);

  return {
    navigateToSignIn,
    navigateToSignUp,
    navigateToResetPassword,
  };
}
