"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getCurrentUserInfo } from "@/actions/auth";

interface OrgContextType {
  organizationId: string | null;
  setOrganizationId: (id: string | null) => void;
  userRole: string | null;
  setUserRole: (role: string | null) => void;
  isLoading: boolean;
}

const OrganizationContext = createContext<OrgContextType>({
  organizationId: null,
  setOrganizationId: () => {},
  userRole: null,
  setUserRole: () => {},
  isLoading: true,
});

export function OrganizationProvider({
  children,
  initialOrgId = null,
  initialRole = null,
}: {
  children: ReactNode;
  initialOrgId?: string | null;
  initialRole?: string | null;
}) {
  const [organizationId, setOrganizationId] = useState<string | null>(initialOrgId);
  const [userRole, setUserRole] = useState<string | null>(initialRole);
  const [isLoading, setIsLoading] = useState(!initialOrgId);

  useEffect(() => {
    if (initialOrgId && initialRole) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    getCurrentUserInfo()
      .then((user) => {
        if (!isMounted) return;
        if (user) {
          if (!organizationId) setOrganizationId(user.organizationId);
          if (!userRole) setUserRole(user.role);
        }
      })
      .catch(() => {
        // Silently handle if unauthenticated
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [initialOrgId, initialRole]);

  return (
    <OrganizationContext.Provider
      value={{
        organizationId,
        setOrganizationId,
        userRole,
        setUserRole,
        isLoading,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useActiveOrganization() {
  return useContext(OrganizationContext);
}
