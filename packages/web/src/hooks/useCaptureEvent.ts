'use client';

import { CaptureOptions } from "posthog-js";
import { PosthogEvent, PosthogEventMap } from "../lib/posthogEvents";

// Fork: telemetry removed. Events are never sent to PostHog.
export function captureEvent<E extends PosthogEvent>(_event: E, _properties: PosthogEventMap[E], _options?: CaptureOptions) {
    return;
}

/**
 * Captures a distinct action as a event and forwards it to the event service
 * (i.e., PostHog).
 *
 * @returns A callback for capturing events.
 * @see: https://posthog.com/docs/libraries/js#capturing-events
 */
const useCaptureEvent = () => {
    return captureEvent;
}

export default useCaptureEvent;
