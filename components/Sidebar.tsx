"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PatientList } from "@/components/PatientList";
import { PatientRecord } from "@/types/patient";
import { FileText, MessageSquare, Menu } from "lucide-react";

interface SidebarProps {
  onRecordSelect: (record: PatientRecord) => void;
  onNewRecord: () => void;
  selectedRecord: PatientRecord | null;
  showMobile: boolean;
  onMobileClose: () => void;
}

export function Sidebar({
  onRecordSelect,
  onNewRecord,
  selectedRecord,
  showMobile,
  onMobileClose,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const SidebarContent = () => (
    <Tabs defaultValue="records" className="flex-1 flex flex-col">
      <TabsList className="w-full justify-start bg-zinc-900 border-b border-zinc-800 rounded-none h-12">
        <TabsTrigger
          value="records"
          className="flex-1 data-[state=active]:bg-zinc-800"
        >
          <FileText className="h-4 w-4 mr-2" />
          RECORDS
        </TabsTrigger>
        <TabsTrigger
          value="chat"
          className="flex-1 data-[state=active]:bg-zinc-800"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          CHAT
        </TabsTrigger>
      </TabsList>

      <TabsContent value="records" className="flex-1 flex flex-col m-0">
        <div className="p-4 flex gap-4">
          <Button
            variant="outline"
            className="flex-1 bg-zinc-900 border-zinc-800"
            onClick={onNewRecord}
          >
            NEW RECORD
          </Button>
        </div>
        <div className="p-4">
          <Input
            placeholder="Search records..."
            className="bg-zinc-900 border-zinc-800"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <PatientList
          onRecordSelect={onRecordSelect}
          selectedRecord={selectedRecord}
          searchQuery={searchQuery}
        />
      </TabsContent>

      <TabsContent value="chat" className="flex-1 p-4 m-0">
        <div className="h-full flex items-center justify-center text-zinc-500">
          Chat functionality coming soon...
        </div>
      </TabsContent>
    </Tabs>
  );

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="md:hidden fixed bottom-4 left-4 z-20 bg-zinc-900 border-zinc-800"
        onClick={() => onMobileClose()}
      >
        <Menu className="h-4 w-4" />
      </Button>

      <aside className="hidden md:flex w-80 border-r border-zinc-800 flex-col">
        <SidebarContent />
      </aside>

      <Sheet open={showMobile} onOpenChange={onMobileClose}>
        <SheetContent
          side="left"
          className="w-80 bg-zinc-950 p-0 border-r border-zinc-800"
        >
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}
