import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Copy, Smartphone, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// ── Configure your UPI ID and merchant name here ──────────────────────────────
const MERCHANT_UPI_ID = "jayjobanputra007@okaxis";
const MERCHANT_NAME   = "Jay Jobanputra";
// ─────────────────────────────────────────────────────────────────────────────

interface UpiPaymentModalProps {
  open: boolean;
  amount: number;
  orderId?: string;
  onConfirmPayment: () => Promise<void>;
  onClose: () => void;
}

const UpiPaymentModal = ({
  open,
  amount,
  orderId,
  onConfirmPayment,
  onClose,
}: UpiPaymentModalProps) => {
  const { toast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);
  const [paid, setPaid] = useState(false);
  const [qrSize, setQrSize] = useState(168);

  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return;
      // Fit QR inside narrow viewports: leave room for padding + border
      const w = window.innerWidth;
      setQrSize(Math.min(200, Math.max(140, w - 72)));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const note = orderId ? `AromaWrap Order ${orderId}` : "AromaWrap Order";

  // Standard UPI deep-link used by all UPI apps (GPay, PhonePe, Paytm, etc.)
  const upiLink = `upi://pay?pa=${encodeURIComponent(MERCHANT_UPI_ID)}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}`;

  const handleCopyUpiId = async () => {
    await navigator.clipboard.writeText(MERCHANT_UPI_ID);
    toast({ title: "UPI ID Copied!", description: MERCHANT_UPI_ID });
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirmPayment();
      setPaid(true);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && !isConfirming) onClose(); }}>
      {/*
        Full-viewport flex center: avoids translate/animation bugs on mobile that push
        the panel to a corner. The white card is the inner div; outer is transparent.
      */}
      <DialogContent
        className={cn(
          "!fixed !inset-0 !left-0 !top-0 !m-0 !flex !h-[100dvh] !min-h-0 !w-full !max-w-none",
          "!translate-x-0 !translate-y-0",
          "items-center justify-center border-0 bg-transparent p-3 shadow-none",
          "overflow-y-auto overflow-x-hidden",
          "sm:p-4",
        )}
      >
        <div
          className={cn(
            "grid w-full max-w-md gap-4 rounded-lg border bg-background p-4 shadow-lg",
            "max-h-[min(88dvh,calc(100dvh-2rem))] overflow-y-auto overflow-x-hidden",
            "box-border",
            "sm:p-6",
          )}
        >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-[#DC143C]">
            Pay via UPI
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            Scan the QR code with any UPI app or open your UPI app directly
          </DialogDescription>
        </DialogHeader>

        {paid ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle2 className="h-20 w-20 text-green-500" />
            <p className="text-lg font-semibold text-center">Payment Confirmed!</p>
            <p className="text-sm text-muted-foreground text-center">
              Your order has been placed successfully.
            </p>
          </div>
        ) : (
          <>
            {/* Amount badge */}
            <div className="flex justify-center">
              <Badge className="text-lg px-4 py-2 bg-[#DC143C] text-white rounded-full">
                ₹{amount.toFixed(2)}
              </Badge>
            </div>

            {/* QR Code */}
            <div className="flex w-full max-w-full flex-col items-center gap-3 p-2 sm:p-4 bg-white border-2 border-dashed border-[#C75D5D] rounded-xl box-border">
              <QRCodeSVG
                value={upiLink}
                size={qrSize}
                bgColor="#ffffff"
                fgColor="#1a1a1a"
                level="M"
                includeMargin
                className="max-w-full h-auto w-auto"
              />
              <p className="text-xs text-muted-foreground text-center">
                Scan with GPay, PhonePe, Paytm, or any UPI app
              </p>
            </div>

            <Separator />

            {/* UPI ID row */}
            <div className="flex items-center justify-between bg-muted/40 rounded-lg px-4 py-3 min-w-0">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">UPI ID</p>
                <p className="font-mono font-semibold text-sm break-all">{MERCHANT_UPI_ID}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={handleCopyUpiId} title="Copy UPI ID" className="shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
            </div>

            {/* Open UPI App — <a href="upi://..."> is the most reliable way to hand off to UPI apps on phone */}
            <Button
              variant="outline"
              className="w-full border-[#DC143C] text-[#DC143C] hover:bg-[#FFF1F1]"
              asChild
            >
              <a href={upiLink} rel="noopener noreferrer">
                <Smartphone className="h-4 w-4 mr-2 inline" />
                Open UPI App
              </a>
            </Button>

            {/* Warning */}
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                Complete the payment in your UPI app, then click <strong>"I Have Paid"</strong> to confirm your order.
              </span>
            </div>

            {/* Confirm / Cancel */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isConfirming}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isConfirming}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Placing...
                  </>
                ) : (
                  "I Have Paid"
                )}
              </Button>
            </div>
          </>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpiPaymentModal;
