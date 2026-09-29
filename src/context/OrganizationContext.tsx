"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { getCurrentUserInfo } from "@/actions/auth";
import type { BusinessVertical } from "@/generated/prisma/enums";

interface OrgContextType {
  organizationId: string | null;
  setOrganizationId: (id: string | null) => void;
  userRole: string | null;
  setUserRole: (role: string | null) => void;
  businessVertical: BusinessVertical;
  setBusinessVertical: (vertical: BusinessVertical) => void;
  isLoading: boolean;
}

const OrganizationContext = createContext<OrgContextType>({
  organizationId: null,
  setOrganizationId: () => {},
  userRole: null,
  setUserRole: () => {},
  businessVertical: "RETAIL_WHOLESALE",
  setBusinessVertical: () => {},
  isLoading: true,
});

export function OrganizationProvider({
  children,
  initialOrgId = null,
  initialRole = null,
  initialVertical = null,
}: {
  children: ReactNode;
  initialOrgId?: string | null;
  initialRole?: string | null;
  initialVertical?: BusinessVertical | null;
}) {
  const [organizationId, setOrganizationId] = useState<string | null>(initialOrgId);
  const [userRole, setUserRole] = useState<string | null>(initialRole);
  const [businessVertical, setBusinessVerticalState] = useState<BusinessVertical>(() => {
    if (initialVertical) return initialVertical;
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("billora_active_business_vertical");
      if (cached) return cached as BusinessVertical;
    }
    return "RETAIL_WHOLESALE";
  });
  const [isLoading, setIsLoading] = useState(!initialOrgId);

  const setBusinessVertical = useCallback((vertical: BusinessVertical) => {
    setBusinessVerticalState(vertical);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("billora_active_business_vertical", vertical);
      } catch {}
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    getCurrentUserInfo()
      .then((user) => {
        if (!isMounted) return;
        if (user) {
          if (!organizationId) setOrganizationId(user.organizationId);
          if (!userRole) setUserRole(user.role);
          if (user.businessVertical) {
            setBusinessVerticalState(user.businessVertical as BusinessVertical);
            if (typeof window !== "undefined") {
              try {
                localStorage.setItem("billora_active_business_vertical", user.businessVertical);
              } catch {}
            }
          }
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
  }, [organizationId, userRole]);

  return (
    <OrganizationContext.Provider
      value={{
        organizationId,
        setOrganizationId,
        userRole,
        setUserRole,
        businessVertical,
        setBusinessVertical,
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
