"use client";

import { useState } from "react";
import type { MentionTarget } from "@/lib/greenpeace-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatLabel } from "@/lib/utils";
import { Plus, X } from "lucide-react";

interface MentionTargetManagerProps {
  targets: MentionTarget[];
  onAddTarget: (target: MentionTarget) => void;
  onRemoveTarget: (index: number) => void;
}

export function MentionTargetManager({
  targets,
  onAddTarget,
  onRemoveTarget,
}: MentionTargetManagerProps) {
  const [label, setLabel] = useState("");
  const [kind, setKind] = useState<MentionTarget["kind"]>("campaigner");
  const [query, setQuery] = useState("");

  const handleAdd = () => {
    const nextLabel = label.trim();
    const nextQuery = query.trim() || nextLabel;

    if (!nextLabel || !nextQuery) {
      return;
    }

    onAddTarget({
      label: nextLabel,
      kind,
      query: nextQuery,
    });

    setLabel("");
    setKind("campaigner");
    setQuery("");
  };

  return (
    <div className="border-b border-border p-4 space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">Custom Targets</p>
        <p className="text-xs text-muted-foreground">
          Add campaigners, article URLs, campaign pages, or branded phrases.
        </p>
      </div>

      <div className="grid gap-2">
        <Input
          placeholder="Label e.g. Nnimmo Bassey"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />

        <div className="grid grid-cols-[1fr_2fr_auto] gap-2">
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as MentionTarget["kind"])}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="campaigner">Campaigner</option>
            <option value="article">Article</option>
            <option value="domain">Domain</option>
            <option value="brand">Brand</option>
          </select>

          <Input
            placeholder='Search query or exact URL. Blank uses the label.'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <Button onClick={handleAdd} type="button" size="sm">
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {targets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {targets.map((target, index) => (
            <div
              key={`${target.kind}-${target.label}-${index}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs"
            >
              <Badge variant="outline" className="capitalize">
                {formatLabel(target.kind)}
              </Badge>
              <span className="max-w-[180px] truncate">{target.label}</span>
              <button
                onClick={() => onRemoveTarget(index)}
                className="text-muted-foreground hover:text-foreground"
                title={`Remove ${target.label}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
