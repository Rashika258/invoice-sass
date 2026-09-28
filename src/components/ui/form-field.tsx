"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InfoTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface FormFieldInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  tooltip?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export function FormFieldInput({
  label,
  tooltip,
  error,
  helperText,
  containerClassName,
  className,
  id,
  required,
  ...props
}: FormFieldInputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {label && (
        <div className="flex items-center gap-1.5">
          <Label htmlFor={inputId} className="text-xs font-semibold text-foreground">
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
          {tooltip && <InfoTooltip text={tooltip} />}
        </div>
      )}
      <Input
        id={inputId}
        required={required}
        className={cn(
          "h-9 text-xs shadow-none",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
      {error ? (
        <p className="text-[11px] font-medium text-destructive">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}

export interface OptionItem {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface FormFieldSelectProps {
  label?: string;
  tooltip?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  options: OptionItem[] | readonly string[];
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  containerClassName?: string;
  triggerClassName?: string;
}

export function FormFieldSelect({
  label,
  tooltip,
  value,
  onValueChange,
  options,
  placeholder = "Select option...",
  error,
  helperText,
  required,
  disabled,
  name,
  containerClassName,
  triggerClassName,
}: FormFieldSelectProps) {
  const formattedOptions: OptionItem[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {label && (
        <div className="flex items-center gap-1.5">
          <Label className="text-xs font-semibold text-foreground">
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
          {tooltip && <InfoTooltip text={tooltip} />}
        </div>
      )}
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      <Select
        value={value}
        onValueChange={(val: any) => {
          if (val !== null && val !== undefined) {
            onValueChange?.(String(val));
          }
        }}
        disabled={disabled}
      >
        <SelectTrigger
          className={cn(
            "h-9 w-full text-xs bg-background shadow-none",
            error && "border-destructive",
            triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {formattedOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled} className="text-xs">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? (
        <p className="text-[11px] font-medium text-destructive">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}

export interface FormFieldTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  tooltip?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
}

export function FormFieldTextarea({
  label,
  tooltip,
  error,
  helperText,
  containerClassName,
  className,
  id,
  required,
  rows = 3,
  ...props
}: FormFieldTextareaProps) {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {label && (
        <div className="flex items-center gap-1.5">
          <Label htmlFor={textareaId} className="text-xs font-semibold text-foreground">
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
          {tooltip && <InfoTooltip text={tooltip} />}
        </div>
      )}
      <Textarea
        id={textareaId}
        rows={rows}
        required={required}
        className={cn(
          "text-xs shadow-none resize-none",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        {...props}
      />
      {error ? (
        <p className="text-[11px] font-medium text-destructive">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}

export interface FormFieldNumberProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  label?: string;
  tooltip?: string;
  value?: number | string;
  onChange?: (val: number) => void;
  error?: string;
  helperText?: string;
  currencySymbol?: string;
  containerClassName?: string;
}

export function FormFieldNumber({
  label,
  tooltip,
  value,
  onChange,
  error,
  helperText,
  currencySymbol,
  containerClassName,
  className,
  id,
  required,
  step = "any",
  min = 0,
  defaultValue,
  ...props
}: FormFieldNumberProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  const isControlled = value !== undefined;
  const valueProps = isControlled
    ? { value }
    : defaultValue !== undefined
    ? { defaultValue }
    : {};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      const val = parseFloat(e.target.value);
      onChange(isNaN(val) ? 0 : val);
    }
  };

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      {label && (
        <div className="flex items-center gap-1.5">
          <Label htmlFor={inputId} className="text-xs font-semibold text-foreground">
            {label} {required && <span className="text-destructive">*</span>}
          </Label>
          {tooltip && <InfoTooltip text={tooltip} />}
        </div>
      )}
      <div className="relative flex items-center">
        {currencySymbol && (
          <span className="absolute left-2.5 text-xs text-muted-foreground font-mono font-medium pointer-events-none">
            {currencySymbol}
          </span>
        )}
        <Input
          id={inputId}
          type="number"
          step={step}
          min={min}
          onChange={handleChange}
          className={cn(
            "h-9 text-xs font-mono shadow-none",
            currencySymbol && "pl-7",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          {...valueProps}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-[11px] font-medium text-destructive">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-muted-foreground">{helperText}</p>
      ) : null}
    </div>
  );
}

