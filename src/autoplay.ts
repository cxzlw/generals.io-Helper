import { simulateClick } from "./algorithm";

/**
 * 从某格移动到某格
 */
// function moveTo(from: Element, to: Element): void {
// }

/**
 * 在相邻格之间移动
 */

function moveNeighbor(from: Element, to: Element): void {
  simulateClick(from);
  simulateClick(to);
}

/**
 * 检查一对相邻格是否可以拓地
 * generals.io 会在使用滚轮缩放时为元素添加 tiny, small, /, large 标签
 */
function tryMove(from: Element, to: Element): boolean {
  if (
    to.classList.length <= 2 &&
    !to.classList.contains("mountain") &&
    !to.classList.contains("neutral") &&
    !to.classList.contains("swamp") &&
    !to.classList.contains("city")
  ) {
    moveNeighbor(from, to);
    return true;
  }
  return false;
}

export { moveNeighbor, tryMove };
