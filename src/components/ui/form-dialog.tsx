"use client";

import React from "react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ActionButton } from "@/components/ui/action-button";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  trigger?: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isSubmitting?: boolean;
  submitText?: string;
  cancelText?: string;
  maxWidthClass?: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  footerExtraActions?: React.ReactNode;
}

export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  trigger,
  onSubmit,
  isSubmitting = false,
  submitText = "Save",
  cancelText = "Cancel",
  maxWidthClass = "sm:max-w-lg",
  children,
  headerActions,
  footerExtraActions,
}: FormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger render={trigger as React.ReactElement} />}
      <DialogContent
        className={cn(
          "max-h-[90vh] flex flex-col overflow-hidden p-0 border border-border shadow-2xl rounded-2xl bg-card",
          maxWidthClass
        )}
      >
        <DialogHeader className="flex flex-row items-center justify-between px-6 py-4 border-b border-border/80 shrink-0 bg-card z-10">
          <div>
            <DialogTitle className="text-base font-bold text-foreground">{title}</DialogTitle>
            {description && (
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                {description}
              </DialogDescription>
            )}
          </div>
          {headerActions && <div className="flex items-center gap-2 mr-6">{headerActions}</div>}
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <DialogBody className="flex-1 overflow-y-auto p-6 space-y-4">{children}</DialogBody>

          <DialogFooter className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/80 bg-muted/10 shrink-0">
            {footerExtraActions}
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="h-9 rounded-xl text-xs font-semibold border-border hover:bg-muted"
            >
              {cancelText}
            </Button>
            <ActionButton
              type="submit"
              isLoading={isSubmitting}
              loadingText="Saving..."
              className="h-9 rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground px-6"
            >
              {submitText}
            </ActionButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
