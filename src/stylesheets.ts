// Normalize before everything else
import "normalize.css/normalize.css";

// Tailwind provides some modern low-level resets that don't need to be compiled
// into the main tailwind.output.css file.
import "tailwindcss/dist/base.css";

// custom fonts
import "@fontsource/rubik";
import "@fontsource/inter";
// end custom fonts

// Third party libraries
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
// end Third party libraries

// Tailwind compiled
import "./tailwind.output.css";

// Our CSS
import "./variables.css";
import "./index.css";
// end our CSS
