import React from "react";

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: string;
}

export function PageHeader({ title, description, actions, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b mb-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {badge && (
            <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {badge}
            </span>
          )}
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2.5 shrink-0">{actions}</div>}
    </div>
  );
}
