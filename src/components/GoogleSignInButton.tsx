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

function measureButtonWidth(el: HTMLElement): number {
  const raw =
    el.clientWidth ||
    el.parentElement?.clientWidth ||
    Math.min(window.innerWidth - 48, 400);
  // Google's button API accepts roughly 200–400px
  return Math.max(200, Math.min(Math.floor(raw), 400));
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
  const containerRef = useRef<HTMLDivElement>(null);
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
    let resizeObserver: ResizeObserver | null = null;
    let lastWidth = 0;

    const render = () => {
      if (cancelled || !buttonRef.current || !containerRef.current || !window.google?.accounts?.id) {
        return;
      }

      const width = measureButtonWidth(containerRef.current);
      if (width === lastWidth && buttonRef.current.childElementCount > 0) return;
      lastWidth = width;

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
    };

    loadGoogleScript()
      .then(() => {
        if (cancelled) return;
        // Wait a frame so the layout width is real on mobile
        requestAnimationFrame(() => {
          render();
          if (containerRef.current && typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(() => render());
            resizeObserver.observe(containerRef.current);
          }
          window.addEventListener("resize", render);
        });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(error instanceof Error ? error.message : "Google Sign-In unavailable");
        }
      });

    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      window.removeEventListener("resize", render);
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
    <div ref={containerRef} className="relative w-full max-w-full overflow-hidden">
      {!ready && (
        <Button type="button" variant="outline" className="w-full" disabled>
          Loading Google…
        </Button>
      )}
      <div
        ref={buttonRef}
        className={`flex w-full max-w-full justify-center overflow-hidden [&_iframe]:max-w-full ${
          disabled ? "pointer-events-none opacity-60" : ""
        } ${ready ? "" : "absolute inset-0 overflow-hidden opacity-0"}`}
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
