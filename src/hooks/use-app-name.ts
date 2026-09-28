"use client";

import { useEffect, useState } from "react";
import {
  getAppName,
  getAppDomain,
  getAppUrl,
  setClientAppName,
  setClientAppDomain,
  APP_NAME_CHANGE_EVENT,
} from "@/lib/app-config";

export function useAppName(): {
  appName: string;
  appDomain: string;
  appUrl: string;
  setAppName: (name: string) => void;
  setAppDomain: (domain: string) => void;
} {
  const [appName, setAppNameState] = useState<string>(() => getAppName());
  const [appDomain, setAppDomainState] = useState<string>(() => getAppDomain());
  const [appUrl, setAppUrlState] = useState<string>(() => getAppUrl());

  useEffect(() => {
    setAppNameState(getAppName());
    setAppDomainState(getAppDomain());
    setAppUrlState(getAppUrl());

    const handleUpdate = () => {
      setAppNameState(getAppName());
      setAppDomainState(getAppDomain());
      setAppUrlState(getAppUrl());
    };

    window.addEventListener(APP_NAME_CHANGE_EVENT, handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener(APP_NAME_CHANGE_EVENT, handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const setAppName = (name: string) => {
    setClientAppName(name);
    setAppNameState(name || getAppName());
  };

  const setAppDomain = (domain: string) => {
    setClientAppDomain(domain);
    setAppDomainState(domain || getAppDomain());
  };

  return {
    appName,
    appDomain,
    appUrl,
    setAppName,
    setAppDomain,
  };
}
