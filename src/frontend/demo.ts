"use client";
import { useStore } from "@/lib/store";
import { workspace, type Workspace } from "@/lib/model";
import type { PreviewPreferences } from "./contracts";
export function usePreview(w: Workspace) {
  const { mutate } = useStore();
  return {
    data: w.preview || {},
    save: (update: (p: PreviewPreferences) => void) =>
      mutate((s) => {
        const v = workspace(s, w.id);
        v.preview ??= {};
        update(v.preview);
      }),
  };
}
