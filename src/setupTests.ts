// react-testing-library renders your components to document.body, this adds
// jest-dom's custom assertions, see:
// https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom/extend-expect";

import elfLocalStorage from "efi/base/localStorage";

beforeEach(() => {
  elfLocalStorage.clear();
});
