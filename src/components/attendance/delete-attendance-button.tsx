"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAttendance } from "@/actions/employees";
import { Button } from "@/components/ui/button";

export function DeleteAttendanceButton({ recordId }: { recordId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this attendance record?")) return;

    setIsDeleting(true);
    try {
      await deleteAttendance(recordId);
      toast.success("Attendance entry deleted");
    } catch {
      toast.error("Failed to delete attendance record");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      disabled={isDeleting}
      className="size-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      title="Delete record"
    >
      <Trash2 className="size-3.5" />
    </Button>
  );
}
