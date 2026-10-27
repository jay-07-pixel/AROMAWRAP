import { Component, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { ChevronDown } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { LavenderCarton } from "@/components/experience/LavenderCarton";
import {
  prepareCartonTextures,
  type CartonTextures,
} from "@/components/experience/cartonTextures";
import { useHeaderHeight, useReducedMotion } from "@/components/experience/experienceHooks";

type BoundaryProps = { children: ReactNode };
type BoundaryState = { failed: boolean };

class CartonErrorBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <p className="text-sm sm:text-base text-muted-foreground text-center">
          The Lavender carton could not be shown on this device.
        </p>
      );
    }
    return this.props.children;
  }
}

function CartonStage({
  error,
  textures,
  trackRef,
  reducedMotion,
}: {
  error: string | null;
  textures: CartonTextures | null;
  trackRef: RefObject<HTMLDivElement | null>;
  reducedMotion: boolean;
}) {
  if (error) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <p className="text-sm sm:text-base text-muted-foreground text-center">{error}</p>
      </div>
    );
  }

  if (!textures) {
    return (
      <div className="flex h-full items-center justify-center px-6">
        <p className="text-sm sm:text-base text-muted-foreground text-center">Loading the Lavender carton…</p>
      </div>
    );
  }

  return (
    <CartonErrorBoundary>
      <LavenderCarton textures={textures} trackRef={trackRef} reducedMotion={reducedMotion} />
    </CartonErrorBoundary>
  );
}

const LavenderExperiencePage = () => {
  const [textures, setTextures] = useState<CartonTextures | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();
  const headerHeight = useHeaderHeight();
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    let current: CartonTextures | null = null;

    prepareCartonTextures()
      .then((next) => {
        if (!alive) {
          next.dispose();
          return;
        }
        current = next;
        setTextures(next);
      })
      .catch(() => {
        if (alive) setError("The Lavender carton artwork could not be loaded.");
      });

    return () => {
      alive = false;
      current?.dispose();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        <section className="container mx-auto px-4 py-10 sm:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs sm:text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
              AromaWrap
            </p>
            <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-bold text-primary">
              Lavender
            </h1>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              {reducedMotion
                ? "The Lavender carton, built from the original packaging artwork."
                : "Scroll to open the Lavender carton, then a quiet home shrine. The smoke is a visual impression of fragrance."}
            </p>
          </div>

          {reducedMotion ? (
            <div
              className="relative mx-auto mt-8 sm:mt-12 max-w-4xl h-[70vh] min-h-[440px] overflow-hidden rounded-2xl border border-border bg-[#f3f0eb]"
              aria-label="Lavender carton"
            >
              <CartonStage error={error} textures={textures} trackRef={trackRef} reducedMotion />
            </div>
          ) : (
            <div ref={trackRef} id="lavender-experience-scroll" className="relative mt-6 h-[800vh] sm:h-[900vh]">
              <div
                className="sticky z-10 flex flex-col"
                style={{ top: headerHeight, height: `calc(100svh - ${headerHeight}px)` }}
              >
                <div
                  className="relative mx-auto min-h-[280px] w-full max-w-4xl flex-1 overflow-hidden rounded-2xl border border-border bg-[#f3f0eb]"
                  aria-label="Lavender carton"
                >
                  <CartonStage error={error} textures={textures} trackRef={trackRef} reducedMotion={false} />
                </div>
                <p className="shrink-0 px-4 pb-2 pt-3 text-center text-xs sm:text-sm text-muted-foreground">
                  Scroll through the carton and the home shrine. Drag to turn the scene.
                  <ChevronDown className="mx-auto mt-1 h-5 w-5 motion-safe:animate-bounce" aria-hidden="true" />
                </p>
              </div>
            </div>
          )}
          {reducedMotion ? (
            <p className="mt-3 text-center text-xs sm:text-sm text-muted-foreground">Drag to turn the carton.</p>
          ) : null}

          <div className="mt-8 sm:mt-10 flex justify-center">
            <Button asChild className="min-h-[44px] px-8 bg-primary hover:bg-primary/90">
              <Link to="/product/lavender">View Lavender product</Link>
            </Button>
          </div>
          <p className="mt-4 text-center text-sm text-muted-foreground">
            <Link to="/experience/devi" className="underline underline-offset-4 hover:text-primary">
              See the Devi Sambrani Dhoop Cup box in 3D
            </Link>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LavenderExperiencePage;
