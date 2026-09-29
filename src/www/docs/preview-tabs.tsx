"use client";

import type { ReactNode } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/liquid/tabs";

/** Preview and Code, switched by the library's own Tabs. */
export function PreviewTabs({
  label,
  preview,
  code,
}: {
  label: string;
  preview: ReactNode;
  code: ReactNode;
}) {
  return (
    <Tabs defaultValue="preview" className="preview">
      <TabsList aria-label={`${label}: preview or code`} className="segmented">
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview" className="preview-panel">
        {preview}
      </TabsContent>
      <TabsContent value="code" className="preview-panel">
        {code}
      </TabsContent>
    </Tabs>
  );
}
