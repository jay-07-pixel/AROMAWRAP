import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              type?: string;
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              logo_alignment?: string;
              width?: number;
            }
          ) => void;
          prompt?: () => void;
        };
      };
    };
  }
}

const GIS_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
let gisScriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gisScriptPromise) return gisScriptPromise;

  gisScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Sign-In")));
      if (window.google?.accounts?.id) resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = GIS_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Sign-In"));
    document.head.appendChild(script);
  });

  return gisScriptPromise;
}

type GoogleSignInButtonProps = {
  onCredential: (credential: string) => void | Promise<void>;
  disabled?: boolean;
  label?: "signin_with" | "signup_with" | "continue_with";
};

export function GoogleSignInButton({
  onCredential,
  disabled = false,
  label = "continue_with",
}: GoogleSignInButtonProps) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || "";
  const buttonRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onCredential);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    loadGoogleScript()
      .then(() => {
        if (cancelled || !buttonRef.current || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response.credential) {
              void callbackRef.current(response.credential);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        buttonRef.current.innerHTML = "";
        const width = Math.min(buttonRef.current.offsetWidth || 320, 400);
        window.google.accounts.id.renderButton(buttonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: label,
          shape: "rectangular",
          logo_alignment: "left",
          width,
        });
        setReady(true);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Google Sign-In unavailable");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, label]);

  if (!clientId) {
    return (
      <Button type="button" variant="outline" className="w-full" disabled>
        Google Sign-In (not configured)
      </Button>
    );
  }

  if (loadError) {
    return (
      <p className="text-center text-sm text-muted-foreground">{loadError}</p>
    );
  }

  return (
    <div className="relative w-full">
      {!ready && (
        <Button type="button" variant="outline" className="w-full" disabled>
          Loading Google…
        </Button>
      )}
      <div
        ref={buttonRef}
        className={`flex w-full justify-center ${disabled ? "pointer-events-none opacity-60" : ""} ${ready ? "" : "absolute inset-0 overflow-hidden opacity-0"}`}
        aria-hidden={!ready}
      />
    </div>
  );
}

export function AuthDivider({ text = "or" }: { text?: string }) {
  return (
    <div className="relative my-1 w-full">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-card px-2 text-muted-foreground">{text}</span>
      </div>
    </div>
  );
}
