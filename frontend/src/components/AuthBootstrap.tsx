"use client";

import { useEffect } from "react";
import { initAuth } from "@/store/auth";

/**
 * Renders nothing. Runs once on client mount to hydrate Zustand auth state
 * from localStorage (token survives page refresh this way).
 * Place this high in the tree, before any component that calls useAuth().
 */
export function AuthBootstrap() {
  useEffect(() => {
    initAuth();
  }, []);

  return null;
}
