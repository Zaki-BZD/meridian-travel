"use client";

import { Component, type ReactNode } from "react";
import Image from "next/image";
import globeStill from "../../../../public/images/globe-fallback.jpg";

/**
 * Whether the browser exposes WebGL at all. Deliberately cheap: probing with a real context
 * is costly, and if context creation fails later, <GlobeBoundary> catches it.
 */
export const hasWebGL = () => typeof window !== "undefined" && "WebGLRenderingContext" in window;

/** A still of the rendered globe, used when WebGL is unavailable or fails. */
export function GlobeStill() {
  return (
    <Image
      src={globeStill}
      alt="A night-time globe with gold routes from London to six destinations"
      fill
      sizes="(min-width: 768px) 72vw, 100vw"
      placeholder="blur"
      // feather the edges so the captured background melts into the hero gradient
      className="object-contain [mask-image:radial-gradient(closest-side,#000_80%,transparent)]"
    />
  );
}

/** Catches WebGL/renderer errors thrown while the canvas mounts. */
export class GlobeBoundary extends Component<{ fallback: ReactNode; onError?: () => void; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError?.();
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
