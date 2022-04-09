function moveNeighbor(from: Element, to: Element): void {
  simulateClick(from);
  simulateClick(to);
}

function BFS(): void {
  let gameMap = document.getElementById("gameMap").children[0];
  let X = gameMap.children.length;
  let Y = gameMap.children[0].children.length;

  function tryMove(from: Element, to: Element): void {
    if (to.classList.length == 1 && to.classList.contains("tiny") ||
        to.classList.length == 2 && to.classList.contains("tiny") && to.classList.contains("attackable"))
      moveNeighbor(from, to);
  };

  for (let x = 0; x < X; ++x) {
    for (let y = 0; y < Y; ++y) {
      let pos = gameMap.children[x].children[y];
      if (pos.classList.contains(myColor) && Number(pos.textContent) > 1) {
        if (x > 0) tryMove(pos, gameMap.children[x - 1].children[y]);
        if (x < X - 1) tryMove(pos, gameMap.children[x + 1].children[y]);
        if (y > 0) tryMove(pos, gameMap.children[x].children[y - 1]);
        if (y < Y - 1) tryMove(pos, gameMap.children[x].children[y + 1]);
      }
    }
  }
}