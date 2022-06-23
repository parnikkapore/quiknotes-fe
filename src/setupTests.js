// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import "@testing-library/jest-dom";

// jsdom bug do be annoying
import structuredClone from "core-js-pure/actual/structured-clone";

// jsdom does not have createObjectURL and revokeObjectURL, so we define them.
// Cr https://github.com/jasongrout/jupyterlab/commit/61b152e650929f45b4b0e9ff99ba8c8186938e6e
function noOp() {}

if (typeof window.URL.createObjectURL === "undefined") {
  Object.defineProperty(window.URL, "createObjectURL", { value: noOp });
  Object.defineProperty(window.URL, "revokeObjectURL", { value: noOp });
}

// Structured clone setup
global.structuredClone = structuredClone;
