function rewriteGame(): void {
  let deads = document.getElementsByClassName("dead");
  let afks = document.getElementsByClassName("afk");

  // 处理死亡和离开了的颜色
  for (let dead of deads)
    for (let key in isAlive)
      if (dead.children[1].classList.contains(key))
        isAlive[key] = false;
  for (let afk of afks)
    for (let key in isAlive)
      if (afk.children[1].classList.contains(key))
        isAlive[key] = false;
  
  // 寻找地图中的城市和皇冠，重写地图
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

  // 从计分板获取信息，重写计分板
  let turncounter = document.getElementById("turn-counter").textContent;
  let gameTurn = Number(turncounter.match(/\d+/g)[0]);
  let confusingDiff = [];

  if (gameTurn === lastTurn.id) return; // generals 每“回合”可以进行两次移动，却只增加一次兵力，这里保证每回合更新一次信息避免 delta 一直为 0
  lastTurn.id = gameTurn;               // 但这样处理似乎不一定是最优方案？

  let playerInfo = document.getElementById("game-leaderboard").children[0].children;
  for (let i = 1, cur: string, lastPos = -1; i < playerInfo.length; ++i) { 
    if (playerInfo[i].children[1].classList.contains("team-name")) {
      playerInfo[i].children[4].textContent = "0";
      playerInfo[i].children[5].textContent = "0";
      lastPos = i; // lastPos 记录当前队伍表示队名的行编号
      continue;
    }

    cur = playerInfo[i].children[1].className.split(' ')[1];
    if (!isAlive[cur]) {
      playerInfo[i].children[4].textContent = "0"; // 如果死去的玩家数据不再变化，就不会成为 0，会影响推断作战玩家
      playerInfo[i].children[5].textContent = "0"; // 故将这两个数设为 0
      continue;
    }

    let army = Number(playerInfo[i].children[2].textContent);
    let delta = army - lastTurn[cur];

    // 城市数量推断方案有待优化，当前存在的问题有且不止有：
    //   双方交战时，delta 可能仍然大于零，却造成城市数量显示异常减少，如果交战时一方 delta < 0，一方 delta > 0，这又会影响到对交战情况的推断
    //   组队模式下，队友兵力的汇入会导致城市数量显示异常增加。
    // confusingDiff: 理论量和获知量的差异，一定程度缓解推断出错的问题，每 11 回合无视此限制强制更新一次
    confusingDiff[cur] = delta - Number(playerInfo[i].children[4].textContent);
    if (gameTurn % 25 !== 0 && delta > 0 && ((confusingDiff[cur] >= -2 && confusingDiff[cur] <= 2) || gameTurn % 11 === 0))
      playerInfo[i].children[4].textContent = delta.toString();

    playerInfo[i].children[5].textContent = delta.toString();
    lastTurn[cur] = army;

    // 处理队伍数据
    if (lastPos !== -1) {
      playerInfo[lastPos].children[4].textContent =
        (Number(playerInfo[lastPos].children[4].textContent) + Number(playerInfo[i].children[4].textContent)).toString();
      playerInfo[lastPos].children[5].textContent =
        (Number(playerInfo[lastPos].children[5].textContent) + Number(playerInfo[i].children[5].textContent)).toString();
    }
  }

  // 推断作战情况，当前方案比较粗糙
  for (let i = 1, cur: string; i < playerInfo.length; ++i) {
    if (playerInfo[i].children[1].classList.contains("team-name"))
      continue;

    cur = playerInfo[i].children[1].className.split(' ')[1];
    if (!isAlive[cur]) continue;

    if (confusingDiff[cur] >= 0) { // 兵力正常增长，一般情况下不应当在作战
      playerInfo[i].children[5].setAttribute("class", "");
      continue;
    }
    let isFighting = false;
    for (let j = 1, curcur: string; j < playerInfo.length; ++j) {
      if (playerInfo[j].children[1].classList.contains("team-name"))
        continue;

      curcur = playerInfo[j].children[1].className.split(' ')[1];
      if (i !== j && confusingDiff[cur] == confusingDiff[curcur]) {
        playerInfo[j].children[5].setAttribute("class", "leaderboard-name " + cur);
        isFighting = true;
        break;
      }
    }
    if (!isFighting)
      playerInfo[i].children[5].setAttribute("class", "");
  }
}

// // 返回一个颜色本回合被其他颜色攻击的损耗（此判断方法有待改进）
// function confusingDiff(pos: HTMLCollection) : number {
//   let delta = Number(pos[5].textContent);
//   let cities = Number(pos[4].textContent);
//   return delta - cities;
// }

// 返回一个格子的颜色
function getColor(pos: any): string {
  for (let color of generalsioColors)
    if (pos.classList.contains(color))
      return color;
  return "meow";
}