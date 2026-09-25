"use client";

import React from "react";
import { ActionButton } from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface GenericFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  title?: string;
  description?: string;
  isSubmitting?: boolean;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  headerExtra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function GenericForm({
  title,
  description,
  isSubmitting = false,
  submitText = "Save Changes",
  cancelText,
  onCancel,
  headerExtra,
  children,
  className,
  onSubmit,
  ...props
}: GenericFormProps) {
  return (
    <Card className={cn("rounded-xl border shadow-xs bg-card", className)}>
      {(title || description || headerExtra) && (
        <CardHeader className="border-b bg-card/60 pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              {title && <CardTitle className="text-base font-semibold">{title}</CardTitle>}
              {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
            </div>
            {headerExtra}
          </div>
        </CardHeader>
      )}

      <CardContent className="pt-4">
        <form onSubmit={onSubmit} className="space-y-4" {...props}>
          {children}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
            {cancelText && onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
                className="h-9 text-xs font-semibold"
              >
                {cancelText}
              </Button>
            )}
            <ActionButton
              type="submit"
              isLoading={isSubmitting}
              loadingText="Saving..."
              className="h-9 text-xs font-bold px-6"
            >
              {submitText}
            </ActionButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
