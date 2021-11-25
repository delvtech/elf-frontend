import versionJson from "./version.output.json";
import efiLocalStorage from "elf/base/localStorage";

export function clearLocalStorageOnNewVersion(): void {
  const lastVersion = efiLocalStorage.getItem("app-version");
  if (lastVersion !== versionJson.version) {
    const styles = [
      "background: #ffff00",
      "color: black",
      "display: block",
      "line-height: 40px",
      "text-align: center",
      "font-weight: bold",
      "font-size: 24px",
    ].join(";");

    // eslint-disable-next-line no-console
    console.log(
      "%c🤘 New app version detected, clearing local storage 🤘",
      styles
    );
    efiLocalStorage.clear();
    efiLocalStorage.setItem("app-version", versionJson.version);
  }
}
