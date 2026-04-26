import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addReport, uid, nowISO } from "@/lib/store";
import { REPORT_REASONS } from "@/lib/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function ReportDialog({
  listingId,
  open,
  onOpenChange,
}: {
  listingId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [reason, setReason] = useState<string>("");
  const [notes, setNotes] = useState("");

  const submit = () => {
    if (!reason) {
      toast.error("اختار سبب البلاغ");
      return;
    }
    addReport({ id: uid(), listingId, reason, notes: notes.trim() || undefined, createdAt: nowISO() });
    toast.success("تم إرسال البلاغ، شكراً ليك");
    onOpenChange(false);
    setReason("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">الإبلاغ عن الإعلان</DialogTitle>
          <DialogDescription>
            اختار سبب البلاغ وهنراجع الإعلان فوراً.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {REPORT_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setReason(r)}
                className={cn("pill", reason === r && "pill-active")}
              >
                {r}
              </button>
            ))}
          </div>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 500))}
            placeholder="تفاصيل إضافية (اختياري)"
            rows={3}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>إلغاء</Button>
          <Button onClick={submit} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            إرسال البلاغ
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
