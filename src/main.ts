import { getColor } from "./algorithm";
import { applyAntiACPatch } from "./anti-ac";
import { tryMove } from "./autoplay";
import { generalsioColors } from "./shared";
/*
 * A generals.io game helper.
 *
 * GitHub Repo: https://github.com/AstralLing/generals.io-Helper
 */

// 颜色是否存活
const isAlive = {
  red: false,
  lightblue: false,
  green: false,
  teal: false,
  orange: false,
  pink: false,
  purple: false,
  maroon: false,
  yellow: false,
  brown: false,
  blue: false,
  purpleblue: false,
};
// 上回合情况
const lastTurn = {
  red: 1,
  lightblue: 1,
  green: 1,
  teal: 1,
  orange: 1,
  pink: 1,
  purple: 1,
  maroon: 1,
  yellow: 1,
  brown: 1,
  blue: 1,
  purpleblue: 1,
  id: 0,
};

let cities: { x: number; y: number }[] = [];
let generals: { x: number; y: number; color: string }[] = [];
let turnObserver: MutationObserver;
let myColor: string;
let lboardCol: number;
let isTeamMode = false;

function rewriteGame(): void {
  // 暂时从 rewriter extract 到 main.ts
  const deads = document.getElementsByClassName("dead");
  const afks = document.getElementsByClassName("afk");

  for (const dead of deads)
    for (const key in isAlive)
      if (dead.children[1].classList.contains(key)) isAlive[key] = false;
  for (const afk of afks)
    for (const key in isAlive)
      if (afk.children[1].classList.contains(key)) isAlive[key] = false;

  /**
   * 重写地图
   * 用上回合记录的信息覆盖地图
   * 再用本回合的信息寻找地图中的城市与皇冠
   */
  const gameMap = document.getElementById("gameMap").children[0];
  const X = gameMap.children.length;
  const Y = gameMap.children[0].children.length;

  for (const general of generals) {
    const pos = gameMap.children[general.x].children[general.y];
    if (!isAlive[general.color]) {
      pos.classList.remove("general", general.color);
      cities.push({ x: general.x, y: general.y });
    } else if (
      !pos.classList.contains("city") &&
      !pos.classList.contains("general")
    ) {
      pos.classList.add("general", general.color, "selected");
    }
  }
  for (const city of cities) {
    const pos = gameMap.children[city.x].children[city.y];
    if (!pos.classList.contains("city") && pos.classList.contains("obstacle")) {
      pos.classList.add("city");
      pos.classList.remove("obstacle");
    }
  }

  cities = [];
  generals = [];

  for (let x = 0; x < X; ++x) {
    for (let y = 0; y < Y; ++y) {
      const pos = gameMap.children[x].children[y];
      if (pos.classList.contains("city")) {
        cities.push({ x: x, y: y });
      } else if (pos.classList.contains("general")) {
        const color = getColor(pos);
        if (isAlive[color]) generals.push({ x: x, y: y, color: color });
      }
    }
  }

  const turncounter = document.getElementById("turn-counter").textContent;
  const gameTurn = Number(turncounter.match(/\d+/g)[0]);
  const confusingDiff = [];

  if (gameTurn === lastTurn.id) return; // generals 每“回合”可以进行两次移动，却只增加一次兵力，这里保证每回合更新一次信息避免 delta 一直为 0
  lastTurn.id = gameTurn;

  const playerInfo =
    document.getElementById("game-leaderboard").children[0].children;
  lboardCol = playerInfo[0].childElementCount;
  for (let i = 1, cur: string, lastPos = -1; i < playerInfo.length; ++i) {
    if (playerInfo[i].children[lboardCol - 5].classList.contains("team-name")) {
      playerInfo[i].children[lboardCol - 2].textContent = "0";
      playerInfo[i].children[lboardCol - 1].textContent = "0";
      lastPos = i; // lastPos 记录当前队伍表示队名的行编号
      continue;
    }

    cur = playerInfo[i].children[lboardCol - 5].className.split(" ")[1];
    if (!isAlive[cur]) {
      playerInfo[i].children[lboardCol - 2].textContent = "0";
      playerInfo[i].children[lboardCol - 1].textContent = "0";
      continue;
    }

    const army = Number(playerInfo[i].children[lboardCol - 4].textContent);
    const delta = army - lastTurn[cur];

    /**
     * 城市数量推断方案有待优化，当前存在的问题有且不止有：
     * 双方交战时，delta 可能仍然大于零，却造成城市数量显示异常减少，如果交战时一方 delta < 0，一方 delta > 0，这又会影响到对交战情况的推断
     * 组队模式下，队友兵力的汇入会导致城市数量显示异常增加。
     * confusingDiff: 理论量和获知量的差异，一定程度缓解推断出错的问题，每 11 回合无视此限制强制更新一次
     */
    confusingDiff[cur] =
      delta - Number(playerInfo[i].children[lboardCol - 2].textContent);
    if (
      gameTurn % 25 !== 0 &&
      delta > 0 &&
      ((confusingDiff[cur] >= -2 && confusingDiff[cur] <= 2) ||
        gameTurn % 11 === 0)
    )
      playerInfo[i].children[lboardCol - 2].textContent = delta.toString();

    playerInfo[i].children[lboardCol - 1].textContent = delta.toString();
    lastTurn[cur] = army;

    if (lastPos !== -1) {
      // 处理队伍数据
      playerInfo[lastPos].children[lboardCol - 2].textContent = (
        Number(playerInfo[lastPos].children[lboardCol - 2].textContent) +
        Number(playerInfo[i].children[lboardCol - 2].textContent)
      ).toString();
      playerInfo[lastPos].children[lboardCol - 1].textContent = (
        Number(playerInfo[lastPos].children[lboardCol - 1].textContent) +
        Number(playerInfo[i].children[lboardCol - 1].textContent)
      ).toString();
    }
  }

  /**
   * 作战情况推断
   * 增量减去城市数相等的颜色大概率在战斗中
   * 当前方案缺陷在于城市数来自推断，不一定准确
   */
  for (let i = 1, cur: string; i < playerInfo.length; ++i) {
    if (playerInfo[i].children[lboardCol - 5].classList.contains("team-name"))
      continue;

    cur = playerInfo[i].children[lboardCol - 5].className.split(" ")[1];
    if (!isAlive[cur]) continue;

    if (confusingDiff[cur] >= 0) {
      // 兵力正常增长，一般情况下不应当在作战
      playerInfo[i].children[lboardCol - 1].setAttribute("class", "");
      continue;
    }
    let isFighting = false;
    for (let j = 1, curcur: string; j < playerInfo.length; ++j) {
      if (playerInfo[j].children[lboardCol - 5].classList.contains("team-name"))
        continue;

      curcur = playerInfo[j].children[lboardCol - 5].className.split(" ")[1];
      if (!isAlive[curcur]) {
        // 如果j玩家死亡，那么j玩家处显示的作战情况为空
        playerInfo[j].children[5].setAttribute("class", "");
        continue; // 跳过j玩家
      }
      if (i !== j && confusingDiff[cur] == confusingDiff[curcur]) {
        playerInfo[j].children[lboardCol - 1].setAttribute(
          "class",
          "leaderboard-name " + cur,
        );
        isFighting = true;
        break;
      }
    }
    if (!isFighting)
      playerInfo[i].children[lboardCol - 1].setAttribute("class", "");
  }
}

/**
 * 从边缘向相邻格拓地
 */
function expandArea(): void {
  // 暂时从 autoplay extract 到 main.ts
  let gameMap = document.getElementById("gameMap").children[0];
  let X = gameMap.children.length;
  let Y = gameMap.children[0].children.length;

  for (let x = 0; x < X; ++x) {
    for (let y = 0; y < Y; ++y) {
      let pos = gameMap.children[x].children[y];
      if (pos.classList.contains(myColor) && Number(pos.textContent) > 1) {
        if (x > 0) {
          if (tryMove(pos, gameMap.children[x - 1].children[y])) break;
        }
        if (x < X - 1) {
          if (tryMove(pos, gameMap.children[x + 1].children[y])) break;
        }
        if (y > 0) {
          if (tryMove(pos, gameMap.children[x].children[y - 1])) break;
        }
        if (y < Y - 1) {
          if (tryMove(pos, gameMap.children[x].children[y + 1])) break;
        }
      }
    }
  }
}

function startObserve(): void {
  const observeTarget = document.getElementById("react-container");
  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (added: any) {
        if (added.id === "game-page") setTimeout(meow, 233);
      });
      mutation.removedNodes.forEach(function (removed: any) {
        if (removed.id === "game-page") turnObserver.disconnect();
      });
    });
  });

  observer.observe(observeTarget, { childList: true, subtree: true });
}

function meow(): void {
  const turncounter = document.getElementById("turn-counter");
  const playerInfo =
    document.getElementById("game-leaderboard").children[0].children;
  turnObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === "characterData") rewriteGame();
    });
  });

  /**
   * 初始化计分板
   *
   * Replay 中，会多一列 POV
   * 组队模式中，队名行默认少一列，通过额外添加星数统计补全
   *
   * 倒数第 6 列：星数
   * 倒数第 5 列：昵称
   * 倒数第 4 列：兵力
   * 倒数第 3 列：土地数量
   * 倒数第 2 列：城市数量
   * 倒数第 1 列：兵力变化量
   */
  lboardCol = playerInfo[0].childElementCount + 2;
  playerInfo[0].appendChild(document.createElement("td"));
  playerInfo[0].children[lboardCol - 2].textContent = "City";
  playerInfo[0].appendChild(document.createElement("td"));
  playerInfo[0].children[lboardCol - 1].textContent = "Delta";

  for (let i = 1, cur: string, lastPos = -1; i < playerInfo.length; ++i) {
    if (playerInfo[i].childElementCount === lboardCol - 3) {
      // is team name
      isTeamMode = true;
      playerInfo[i].children[lboardCol - 6].removeAttribute("colspan");
      playerInfo[i].insertBefore(
        document.createElement("td"),
        playerInfo[i].children[lboardCol - 6],
      );
      playerInfo[i].children[lboardCol - 6].textContent = "0";
      playerInfo[i].appendChild(document.createElement("td"));
      playerInfo[i].children[lboardCol - 2].textContent = "1";
      playerInfo[i].appendChild(document.createElement("td"));
      playerInfo[i].children[lboardCol - 1].textContent = "Loading";
      lastPos = i; // lastPos 记录当前队伍表示队名的行编号
      continue;
    }
    cur = playerInfo[i].children[lboardCol - 5].className.split(" ")[1];
    playerInfo[i].appendChild(document.createElement("td"));
    playerInfo[i].children[lboardCol - 2].textContent = "1";
    playerInfo[i].appendChild(document.createElement("td"));
    playerInfo[i].children[lboardCol - 1].textContent = "Loading";
    (lastTurn[cur] = 1), (isAlive[cur] = true);

    if (lastPos !== -1) {
      const curStars = Number(
        playerInfo[i].children[lboardCol - 6].textContent.match(/\d+/g)[0],
      );
      playerInfo[lastPos].children[lboardCol - 6].textContent = (
        Number(playerInfo[lastPos].children[0].textContent) + curStars
      ).toString();
    }
  }

  // 显示队伍星数
  for (let i = 1; i < playerInfo.length; ++i) {
    const colorful = document.createElement("span");
    colorful.setAttribute("style", "color: goldenrod");
    colorful.textContent = "★ ";
    if (playerInfo[i].children[lboardCol - 5].classList.contains("team-name"))
      playerInfo[i].children[lboardCol - 6].insertBefore(
        colorful,
        playerInfo[i].children[lboardCol - 6].firstChild,
      );
  }

  // 获取自身颜色
  const gameMap = document.getElementById("gameMap").children[0];
  const X = gameMap.children.length;
  const Y = gameMap.children[0].children.length;
  for (let x = 0, flag = false; x < X; ++x) {
    for (let y = 0; y < Y; ++y) {
      const pos = gameMap.children[x].children[y];
      if (pos.classList.contains("selectable"))
        for (const color of generalsioColors)
          if (pos.classList.contains(color)) {
            myColor = color;
            flag = true;
            break;
          }
      if (flag) break;
    }
    if (flag) break;
  }

  document.onkeyup = function (event) {
    if (document.activeElement.id == "chatroom-input") return false;
    const e = event || window.event || arguments.callee.caller.arguments[0];
    if (e && e.keyCode == 66)
      // B
      expandArea();
  };

  turnObserver.observe(turncounter, {
    attributes: true,
    characterData: true,
    subtree: true,
  });

  cities = [];
  generals = [];
}

applyAntiACPatch();
startObserve();
