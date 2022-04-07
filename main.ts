
/*
 * A generals.io game helper.
 *
 * GitHub Repo: https://github.com/AstralLing/generals.io-Helper
 */
export { };

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
var cities: { x: number, y: number }[] = [],
  generals: { x: number, y: number, color: string }[] = [];
var gameObserver: any;

function startObserve() {
  let observeTarget = document.getElementById("react-container");
  let observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (added: any) {
        if (added.id === "game-page")
          setTimeout(meow, 100);
      });
      mutation.removedNodes.forEach(function (removed: any) {
        if (removed.id === "game-page")
          gameObserver.disconnect();
      });
    });
  });

  observer.observe(observeTarget, { childList: true, subtree: true });
}

function meow() {
  let leaderboard = document.getElementById("game-leaderboard");
  gameObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === "characterData")
        update();
    });
  });
  for (let color of GeneralsIOColors)
    for (let id = 1; id < leaderboard.children[0].children.length; ++id)
      if (leaderboard.children[0].children[id].children[1].classList.contains(color))
        isAlive[color] = true;
  gameObserver.observe(leaderboard, { attributes: true, characterData: true, subtree: true });

  cities = [];
  generals = [];
}

function update() {
  let deads = document.getElementsByClassName("dead");

  for (let dead of deads)
    for (let key in isAlive)
      if (dead.children[1].classList.contains(isAlive[key]))
        isAlive[key] = false;

  let gameMap = document.getElementById("gameMap").children[0];
  let X = gameMap.children.length;
  let Y = gameMap.children[0].children.length;

  for (let general of generals) {
    let pos = gameMap.children[general.x].children[general.y];
    if (!isAlive[general.color]) {
      pos.classList.remove("general", general.color)
      cities.push({ x: general.x, y: general.y })
    }
    else if (!pos.classList.contains("city") && !pos.classList.contains("general")) {
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
}

function getColor(pos: any) {
  for (let color of GeneralsIOColors)
    if (pos.classList.contains(color))
      return color;
  return "meow";
}

startObserve();