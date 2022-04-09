
/*
 * A generals.io game helper.
 *
 * GitHub Repo: https://github.com/AstralLing/generals.io-Helper
 */

const GeneralsIOColors = ["red", "lightblue", "green", "teal", "orange", "pink", "purple", "maroon", "yellow", "brown", "blue", "purple-blue"];

var isAlive = {
  "red": false,
  "lightblue": false,
  "green": false,
  "teal": false,
  "orange": false,
  "pink": false,
  "purple": false,
  "maroon": false,
  "yellow": false,
  "brown": false,
  "blue": false,
  "purple-blue": false
};
var lastTurn = {
  "red": 1,
  "lightblue": 1,
  "green": 1,
  "teal": 1,
  "orange": 1,
  "pink": 1,
  "purple": 1,
  "maroon": 1,
  "yellow": 1,
  "brown": 1,
  "blue": 1,
  "purple-blue": 1,
  "id": 0
}
var cities: { x: number, y: number }[] = [];
var generals: { x: number, y: number, color: string }[] = [];
var turnObserver: MutationObserver;
var myColor: string;

function startObserve(): void {
  let observeTarget = document.getElementById("react-container");
  let observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (added: any) {
        if (added.id === "game-page")
          setTimeout(meow, 100);
      });
      mutation.removedNodes.forEach(function (removed: any) {
        if (removed.id === "game-page")
          turnObserver.disconnect();
      });
    });
  });

  observer.observe(observeTarget, { childList: true, subtree: true });
}

function meow(): void {
  let turncounter = document.getElementById("turn-counter");
  let playerInfo = document.getElementById("game-leaderboard").children[0].children;
  turnObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === "characterData")
        rewriteGame();
    });
  });

  playerInfo[0].appendChild(document.createElement('td'));
  playerInfo[0].children[4].textContent = "City";
  playerInfo[0].appendChild(document.createElement('td'));
  playerInfo[0].children[5].textContent = "Delta";

  for (let i = 1, cur: string, lastPos = -1; i < playerInfo.length; ++i) {
    if (playerInfo[i].children.length === 3) { // is team name
      playerInfo[i].children[0].removeAttribute("colspan");
      playerInfo[i].insertBefore(document.createElement('td'), playerInfo[i].firstChild);
      playerInfo[i].children[0].textContent = "0";
      playerInfo[i].appendChild(document.createElement('td'));
      playerInfo[i].children[4].textContent = "1";
      playerInfo[i].appendChild(document.createElement('td'));
      playerInfo[i].children[5].textContent = "Loading";
      lastPos = i;
      continue;
    }
    cur = playerInfo[i].children[1].className.split(' ')[1];
    playerInfo[i].appendChild(document.createElement('td'));
    playerInfo[i].children[4].textContent = "1";
    playerInfo[i].appendChild(document.createElement('td'));
    playerInfo[i].children[5].textContent = "Loading";
    lastTurn[cur] = 1, isAlive[cur] = true;

    if (lastPos !== -1) {
      let curStars = Number(playerInfo[i].children[0].textContent.match(/\d+/g)[0]);
      playerInfo[lastPos].children[0].textContent =
        (Number(playerInfo[lastPos].children[0].textContent) + curStars).toString();
    }
  }

  for (let i = 1; i < playerInfo.length; ++i) {
    let colorful = document.createElement("span");
    colorful.setAttribute("style", "color: goldenrod");
    colorful.textContent = "★ ";
    if (playerInfo[i].children[1].classList.contains("team-name"))
      playerInfo[i].children[0].insertBefore(colorful, playerInfo[i].children[0].firstChild);
  }

  turnObserver.observe(turncounter, { attributes: true, characterData: true, subtree: true });

  cities = [];
  generals = [];
}

startObserve();