import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Buttons or tabs on the right. */
  actions?: React.ReactNode;
}

/** Title + one-line description at the top of a page, actions on the right. */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
        {description && <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
