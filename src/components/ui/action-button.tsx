"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ActionButtonProps extends ButtonProps {
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function ActionButton({
  isLoading = false,
  loadingText,
  icon,
  children,
  disabled,
  className,
  variant = "default",
  size = "default",
  ...props
}: ActionButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      className={cn("font-semibold cursor-pointer transition-all active:scale-[0.98]", className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          {loadingText || children}
        </>
      ) : (
        <>
          {icon && <span className="mr-2 shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </Button>
  );
}

export interface ConfirmActionButtonProps extends Omit<ActionButtonProps, "onClick"> {
  confirmMessage?: string;
  onConfirm: () => Promise<void> | void;
}

export function ConfirmActionButton({
  confirmMessage = "Are you sure you want to perform this action?",
  onConfirm,
  children = "Delete",
  variant = "destructive",
  size = "sm",
  className,
  ...props
}: ConfirmActionButtonProps) {
  const [isExecuting, setIsExecuting] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!window.confirm(confirmMessage)) return;

    setIsExecuting(true);
    try {
      await onConfirm();
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <ActionButton
      variant={variant}
      size={size}
      isLoading={isExecuting}
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </ActionButton>
  );
}
