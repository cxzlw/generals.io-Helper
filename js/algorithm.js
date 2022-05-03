/**
 * 模拟鼠标点击
 */
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
/**
 * 获取地图中某个位置的所属颜色
 * 实际上是返回某个元素包含的颜色类名
 */
function getColor(pos) {
  for (let color of generalsioColors)
    if (pos.classList.contains(color))
      return color;
  return "meow";
}
