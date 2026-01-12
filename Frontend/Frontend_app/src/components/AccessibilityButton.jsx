import { useState } from "react";
import { useAccessibility } from "../context/AccessibilityContext";
import "../css/Accessibility.css";

export default function AccessibilityButton() {
  const [open, setOpen] = useState(false);
  const {
    fontScale,
    setFontScale,
    highContrast,
    setHighContrast
  } = useAccessibility();

  return (
    <div className="accessibility-wrapper">
      <button
        className="accessibility-toggle"
        onClick={() => setOpen(!open)}
        aria-label="Accesibilidad"
      >
        ♿
      </button>

      {open && (
        <div className="accessibility-panel">
          <h4>Accesibilidad</h4>

          <button onClick={() => setFontScale(Math.min(fontScale + 0.1, 1.5))}>
            A+
          </button>

          <button onClick={() => setFontScale(Math.max(fontScale - 0.1, 0.8))}>
            A-
          </button>

          <button onClick={() => setHighContrast(!highContrast)}>
            {highContrast ? "Normal" : "Alto contraste"}
          </button>
        </div>
      )}
    </div>
  );
}
