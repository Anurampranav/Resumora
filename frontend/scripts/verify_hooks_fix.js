/**
 * Verifies the UploadModal hooks-order fix at runtime, not just by code
 * review. The bug only manifests when a single mounted instance transitions
 * `open: false -> true` — exactly what TopNav does (it always renders
 * <UploadModal open={modalOpen} .../>, so the component mounts on page
 * load with open=false, then re-renders in place when the button is
 * clicked). renderToString can't reproduce this since each call is a fresh
 * tree with no persistent fiber; react-test-renderer's .update() on the
 * same instance can.
 */
const React = require("react");
const TestRenderer = require("react-test-renderer");
const { act } = TestRenderer;

// TSX needs transpiling; use Node's require hook via esbuild-register-free
// approach isn't available here, so compile this one file with the TS
// compiler already present in node_modules.
require("ts-node/register/transpile-only");

let sawHookError = false;
const originalConsoleError = console.error;
console.error = (...args) => {
  const msg = args.join(" ");
  if (msg.includes("Rendered more hooks") || msg.includes("change in the order of Hooks")) {
    sawHookError = true;
  }
  originalConsoleError(...args);
};

const UploadModal = require("../components/UploadModal").default;

let renderer;
act(() => {
  renderer = TestRenderer.create(
    React.createElement(UploadModal, { open: false, onClose: () => {}, jobRoles: [] })
  );
});

act(() => {
  renderer.update(React.createElement(UploadModal, { open: true, onClose: () => {}, jobRoles: [] }));
});

act(() => {
  renderer.update(React.createElement(UploadModal, { open: false, onClose: () => {}, jobRoles: [] }));
});

act(() => {
  renderer.update(React.createElement(UploadModal, { open: true, onClose: () => {}, jobRoles: [] }));
});

console.error = originalConsoleError;

if (sawHookError) {
  console.log("FAIL: hooks-order error still occurs on open/close transitions");
  process.exit(1);
} else {
  console.log("PASS: no hooks-order error across open/close/open/close transitions");
  process.exit(0);
}
