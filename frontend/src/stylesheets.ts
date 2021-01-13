// Normalize before everything else
import "normalize.css/normalize.css";

// custom fonts
import "@fontsource/open-sans";
// end custom fonts

// Tailwind provides low-level css utilities
import "./tailwind.output.css";
// end Tailwind

// Third party libraries
import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
// end Third party libraries

// Our CSS
import "./variables.css";
import "./index.css";
// end our CSS
