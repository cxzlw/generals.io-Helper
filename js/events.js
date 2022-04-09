const simulateMD = new MouseEvent('mousedown', {
  view: window,
  bubbles: true,
  cancelable: true
});
const simulateMU = new MouseEvent('mouseup', {
  view: window,
  bubbles: true,
  cancelable: true
});
function simulateClick(clickPos) {
  clickPos.dispatchEvent(simulateMD);
  clickPos.dispatchEvent(simulateMU);
}
