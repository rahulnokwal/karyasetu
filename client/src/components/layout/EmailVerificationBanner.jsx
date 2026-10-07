import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { authApi } from "../../api/authApi";
import { MailWarning, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function EmailVerificationBanner() {
  const { user } = useAuthStore();
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  if (!user || user.isEmailVerified) return null;

  const handleResend = async () => {
    if (cooldown > 0) return;
    setIsSending(true);
    try {
      await authApi.resendVerificationEmail();
      toast.success("Verification email sent! Check your inbox.");
      setCooldown(120);
    } catch (error) {
      toast.error(error.message || "Failed to resend verification email");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-xs text-amber-900 flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <MailWarning className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          Your email <strong>{user.email}</strong> is not verified yet. Please
          check your inbox to verify your account to unlock all workspace
          features.
        </span>
      </div>
      <button
        onClick={handleResend}
        disabled={isSending || cooldown > 0}
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-amber-600 hover:bg-amber-700 text-white font-medium transition-colors disabled:opacity-50"
      >
        {isSending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Send className="w-3.5 h-3.5" />
        )}
        {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Link"}
      </button>
    </div>
  );
}
