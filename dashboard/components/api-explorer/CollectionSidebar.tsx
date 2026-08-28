"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/cn";
import type { ExplorerCollection, SavedRequest } from "./types";

interface CollectionSidebarProps {
  collections: ExplorerCollection[];
  activeRequestId: string | null;
  onSelectRequest: (request: SavedRequest) => void;
  onCollectionsChange: (collections: ExplorerCollection[]) => void;
}

export function CollectionSidebar({
  collections,
  activeRequestId,
  onSelectRequest,
  onCollectionsChange,
}: CollectionSidebarProps) {
  const [renameTarget, setRenameTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [newName, setNewName] = useState("");
      console.log("toggleExpanded", collections);

  function toggleExpanded(collectionId: string) {
    onCollectionsChange(
      collections.map((c) =>
        c.id === collectionId ? { ...c, expanded: !c.expanded } : c
      )
    );
  }

  function addCollection() {
    const id = `col-${Date.now()}`;
    onCollectionsChange([
      ...collections,
      {
        id,
        name: "New Collection",
        expanded: true,
        requests: [],
      },
    ]);
    setRenameTarget({ id, name: "New Collection" });
    setNewName("New Collection");
  }

  function deleteCollection(id: string) {
    onCollectionsChange(collections.filter((c) => c.id !== id));
  }

  function confirmRename() {
    if (!renameTarget || !newName.trim()) return;
    onCollectionsChange(
      collections.map((c) =>
        c.id === renameTarget.id ? { ...c, name: newName.trim() } : c
      )
    );
    setRenameTarget(null);
    setNewName("");
  }

  return (
    <aside className="flex h-full w-[280px] shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-muted-foreground)]">
          Collections
        </p>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={addCollection}>
          New
        </Button>
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {collections.map((collection) => (
          <div key={collection.id} className="rounded-md">
            <div className="group flex items-center gap-1 px-2 py-1.5">
              <button
                type="button"
                onClick={() => toggleExpanded(collection.id)}
                className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
                aria-label={collection.expanded ? "Collapse" : "Expand"}
              >
                {collection.expanded ? (
                  <ChevronDown className="h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5" />
                )}
              </button>
              <span className="flex-1 truncate text-sm text-[var(--color-foreground)]">
                {collection.name}
              </span>
              <div className="hidden gap-1 group-hover:flex">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1.5 text-[10px]"
                  onClick={() => {
                    setRenameTarget({ id: collection.id, name: collection.name });
                    setNewName(collection.name);
                  }}
                >
                  Rename
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-1.5 text-[10px] text-[var(--color-destructive)]"
                  onClick={() => deleteCollection(collection.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
            {collection.expanded && (
              <div className="ml-5 space-y-0.5 pb-2">
                {collection.requests.map((request) => {
                  const active = activeRequestId === request.id;
                  return (
                    <button
                      key={request.id}
                      type="button"
                      onClick={() => onSelectRequest(request)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                        active
                          ? "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20"
                          : "text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
                      )}
                    >
                      <span className="font-mono">{request.method}</span>
                      <span className="truncate">{request.name}</span>
                    </button>
                  );
                })}
                {collection.requests.length === 0 && (
                  <p className="px-2 py-1 text-[10px] text-[var(--color-muted-foreground)]">
                    No requests yet
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={!!renameTarget} onOpenChange={() => setRenameTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename collection</DialogTitle>
          </DialogHeader>
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Collection name"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button onClick={confirmRename}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
