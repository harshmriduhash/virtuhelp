"use client";

import { useState } from "react";
import { SettingsSheet } from "./SettingsSheet";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface SettingsModelProps {
  subscription: {
    plan: string;
    questionsUsed: number;
    documentsUsed: number;
    questionsPerMonth: number;
    documentsPerMonth: number;
    validUntil: Date;
  } | null;
}

export function SettingsModel({ subscription }: SettingsModelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="h-8 w-8"
        title="Settings"
      >
        <Settings className="h-4 w-4" />
      </Button>

      <SettingsSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        subscription={subscription}
      />
    </>
  );
}
