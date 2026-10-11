import { PosthogEvent, PosthogEventMap } from './posthogEvents.js';

// Fork: telemetry removed. Events are never sent to PostHog.
export function captureEvent<E extends PosthogEvent>(_event: E, _properties: PosthogEventMap[E]) {
    return;
}

export async function shutdownPosthog() {
    return;
}
