/**
 * 从某格移动到某格
 */
// function moveTo(from: Element, to: Element): void {
// }
/**
 * 在相邻格之间移动
 */
function moveNeighbor(from, to) {
  simulateClick(from);
  simulateClick(to);
}
/**
 * 检查一对相邻格是否可以拓地
 * generals.io 会在使用滚轮缩放时为元素添加 tiny, small, /, large 标签
 */
function tryMove(from, to) {
  if (to.classList.length <= 2 &&
    !to.classList.contains("mountain") &&
    !to.classList.contains("neutral") &&
    !to.classList.contains("swamp") &&
    !to.classList.contains("city")) {
    moveNeighbor(from, to);
    return true;
  }
  return false;
}
;
/**
 * 从边缘向相邻格拓地
 */
function expandArea() {
  let gameMap = document.getElementById("gameMap").children[0];
  let X = gameMap.children.length;
  let Y = gameMap.children[0].children.length;
  for (let x = 0; x < X; ++x) {
    for (let y = 0; y < Y; ++y) {
      let pos = gameMap.children[x].children[y];
      if (pos.classList.contains(myColor) && Number(pos.textContent) > 1) {
        if (x > 0) {
          if (tryMove(pos, gameMap.children[x - 1].children[y]))
            break;
        }
        if (x < X - 1) {
          if (tryMove(pos, gameMap.children[x + 1].children[y]))
            break;
        }
        if (y > 0) {
          if (tryMove(pos, gameMap.children[x].children[y - 1]))
            break;
        }
        if (y < Y - 1) {
          if (tryMove(pos, gameMap.children[x].children[y + 1]))
            break;
        }
      }
    }
  }
}
