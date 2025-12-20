/**
 * Styles Index - Import this to initialize global styles
 */

// Initialize theme CSS variables
import "./theme.css";

// Initialize global styles
import "./global.css";

// Re-export theme for use in components
export { vars } from "./theme.css";
export { spin, pulse, fadeIn, slideDown } from "./global.css";
