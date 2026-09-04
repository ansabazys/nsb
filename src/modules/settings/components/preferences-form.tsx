"use client";

import * as React from "react";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export function PreferencesForm() {
  return (
    <div className="space-y-4 max-w-xl">
      <div className="grid grid-cols-2 gap-4">
        <Select label="Theme" defaultValue="system">
          <option value="system">System Default</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </Select>

        <Select label="First Day of Week" defaultValue="monday">
          <option value="monday">Monday</option>
          <option value="sunday">Sunday</option>
        </Select>
      </div>

      <div className="pt-2">
        <Button type="button" size="sm" variant="secondary" disabled>
          Preferences Saved Automatically
        </Button>
      </div>
    </div>
  );
}
