function rewriteGame(): void {
  let deads = document.getElementsByClassName("dead");
  let afks = document.getElementsByClassName("afk");

  for (let dead of deads)
    for (let key in isAlive)
      if (dead.children[1].classList.contains(key))
        isAlive[key] = false;
  for (let afk of afks)
    for (let key in isAlive)
      if (afk.children[1].classList.contains(key))
        isAlive[key] = false;
  
  let gameMap = document.getElementById("gameMap").children[0];
  let X = gameMap.children.length;
  let Y = gameMap.children[0].children.length;

  for (let general of generals) {
    let pos = gameMap.children[general.x].children[general.y];
    if (!isAlive[general.color]) {
      pos.classList.remove("general", general.color);
      cities.push({ x: general.x, y: general.y });
    } else if (!pos.classList.contains("city") && !pos.classList.contains("general")) {
      pos.classList.add("general", general.color, "selected");
    }
  }
  for (let city of cities) {
    let pos = gameMap.children[city.x].children[city.y];
    if (!pos.classList.contains("city") && pos.classList.contains("obstacle")) {
      pos.classList.add("city");
      pos.classList.remove("obstacle");
    }
  }

  cities = [];
  generals = [];

  for (let x = 0; x < X; ++x) {
    for (let y = 0; y < Y; ++y) {
      let pos = gameMap.children[x].children[y];
      if (pos.classList.contains("city")) {
        cities.push({ x: x, y: y });
      } else if (pos.classList.contains("general")) {
        let color = getColor(pos);
        if (isAlive[color])
          generals.push({ x: x, y: y, color: color });
      }
    }
  }

  let turncounter = document.getElementById("turn-counter").textContent;
  let gameTurn = Number(turncounter.match(/\d+/g)[0]);

  if (gameTurn === lastTurn.id) return;
  lastTurn.id = gameTurn;

  let playerInfo = document.getElementById("game-leaderboard").children[0].children;
  for (let i = 1, cur: string, lastPos = -1; i < playerInfo.length; ++i) {
    if (playerInfo[i].children[1].classList.contains("team-name")) {
      playerInfo[i].children[4].textContent = "0";
      playerInfo[i].children[5].textContent = "0";
      lastPos = i;
      continue;
    }

    cur = playerInfo[i].children[1].className.split(' ')[1];
    if (!isAlive[cur]) continue;

    let army = Number(playerInfo[i].children[2].textContent);
    let delta = army - lastTurn[cur];

    if (gameTurn % 25 !== 0 && delta > 0 &&
      delta - Number(playerInfo[i].children[4].textContent) <= 2)
      playerInfo[i].children[4].textContent = delta.toString();

    playerInfo[i].children[5].textContent = delta.toString();
    lastTurn[cur] = army;

    if (lastPos !== -1) {
      playerInfo[lastPos].children[4].textContent =
        (Number(playerInfo[lastPos].children[4].textContent) + Number(playerInfo[i].children[4].textContent)).toString();
      playerInfo[lastPos].children[5].textContent =
        (Number(playerInfo[lastPos].children[5].textContent) + Number(playerInfo[i].children[5].textContent)).toString();
    }
  }

  for (let i = 1, cur: string; i < playerInfo.length; ++i) {
    if (playerInfo[i].children[1].classList.contains("team-name"))
      continue;

    cur = playerInfo[i].children[1].className.split(' ')[1];
    if (!isAlive[cur]) continue;

    if (Number(playerInfo[i].children[5].textContent) > 0) {
      playerInfo[i].children[5].setAttribute("class", "");
      continue;
    }
    let isFighting: boolean = false;
    for (let j = 1; j < playerInfo.length; ++j) {
      if (playerInfo[i].children[1].classList.contains("team-name"))
        continue;
      if (i !== j && playerInfo[i].children[5].textContent === playerInfo[j].children[5].textContent) {
        playerInfo[i].children[5].setAttribute("class", "leaderboard-name " + cur);
        isFighting = true;
        break;
      }
    }
    if (!isFighting)
      playerInfo[i].children[5].setAttribute("class", "");
  }
}

function getColor(pos: any): string {
  for (let color of generalsioColors)
    if (pos.classList.contains(color))
      return color;
  return "meow";
}