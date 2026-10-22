import React from "react";
import { SettingsContainer } from "../components/settingsContainer";

/**
 * The config editor benefits from the full-width, full-height variant of
 * `SettingsContainer` (same as Members): long JSON lines and a tall editing
 * surface.
 */
export default function ConfigurationSettingsLayout({ children }: { children: React.ReactNode }) {
    return <SettingsContainer variant="full">{children}</SettingsContainer>;
}
