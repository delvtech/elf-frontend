/**
 * CRA requires that this file live at the top-level, ie: src/index.tsx
 */

import React from "react";
import ReactDOM from "react-dom";

import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "normalize.css/normalize.css";
import "@blueprintjs/core/lib/css/blueprint.css";

// Import tailwind after blueprint so that applying tailwind classes to
// blueprint components overrides the blueprint styling
import "./tailwind.output.css";

import "./index.css";

import App from "efi/ui/app/App/App";
import * as serviceWorker from "serviceWorker";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
