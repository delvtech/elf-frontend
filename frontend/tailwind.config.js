const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  purge: {
    // tree shake tailwind css for production builds
    content: ["./src/efi/**/*.tsx", "./src/efi/**/*.ts"],
  },
  future: {
    // don't use deprecated grid gap utilities
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  theme: {
    minHeight: {
      0: "0",
      "1/4": "25%",
      "1/2": "50%",
      "3/4": "75%",
      full: "100%",
    },
    colors: {
      // these can be used as 'text-primary' etc.
      primary: "var(--bp3-intent-primary)",
      success: "var(--bp3-intent-success)",
      warning: "var(--bp3-intent-warning)",
      danger: "var(--bp3-intent-danger)",
      muted: "var(--bp3-text-muted)",
      disabled: "var(--bp3-text-disabled)",
      ...defaultTheme.colors,
    },
    extend: {},
  },
};
