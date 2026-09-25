import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { getWorkspacePreferences, setWorkspacePreferences } from '@/lib/workspace-preferences';

/**
 * Continue‑Where‑You‑Left‑Off widget – shows shortcuts to pages where the user
 * left an unfinished task or applied a filter. State is persisted via
 * `workspace-preferences` (localStorage).
 */
export function ContinueWhereWidget() {
  const [items, setItems] = useState<Array<{ href: string; label: string }>>([]);

  useEffect(() => {
    // Load persisted shortcuts from localStorage
    const pref = getWorkspacePreferences('continueWhere') as Array<{ href: string; label: string }>;
    if (pref) setItems(pref);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-4">
      {items.map((it, idx) => (
        <Card key={idx} className="shadow-2xs border border-border/70">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{it.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs"
              onClick={() => {
                // Navigate and clear the shortcut
                setWorkspacePreferences('continueWhere', []);
                window.location.href = it.href;
              }}
            >
              Go
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
