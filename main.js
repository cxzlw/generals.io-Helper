"use strict";
// exports.__esModule = true;
var GeneralsIOColors = ["red", "lightblue", "green", "teal", "orange", "pink", "purple", "maroon", "yellow", "brown", "blue", "purple-blue"];
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
var lastGame = {
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
    "purple-blue": 1
};
var cities = [];
var generals = [];
var gameObserver;
function startObserve() {
    var observeTarget = document.getElementById("react-container");
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            mutation.addedNodes.forEach(function (added) {
                if (added.id === "game-page")
                    setTimeout(meow, 100);
            });
            mutation.removedNodes.forEach(function (removed) {
                if (removed.id === "game-page")
                    gameObserver.disconnect();
            });
        });
    });
    observer.observe(observeTarget, { childList: true, subtree: true });
}
function meow() {
    var leaderboard = document.getElementById("game-leaderboard");
    var playerInfo = leaderboard.children[0].children;
    gameObserver = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            if (mutation.type === "characterData")
                rewriteGame();
        });
    });
    for (var _i = 0, GeneralsIOColors_1 = GeneralsIOColors; _i < GeneralsIOColors_1.length; _i++) {
        var color = GeneralsIOColors_1[_i];
        for (var i = 1; i < playerInfo.length; ++i)
            if (playerInfo[i].children[1].classList.contains(color))
                isAlive[color] = true;
    }
    playerInfo[0].appendChild(document.createElement('td'));
    playerInfo[0].children[4].textContent = "City";
    playerInfo[0].appendChild(document.createElement('td'));
    playerInfo[0].children[5].textContent = "Delta";
    for (var i = 1, cur = void 0; i < playerInfo.length; ++i) {
        cur = playerInfo[i].children[1].className.split(' ')[1];
        lastGame[cur] = 1;
        playerInfo[i].appendChild(document.createElement('td'));
        playerInfo[i].children[4].textContent = "1";
        playerInfo[i].appendChild(document.createElement('td'));
        playerInfo[i].children[5].textContent = "0";
    }
    gameObserver.observe(leaderboard, { attributes: true, characterData: true, subtree: true });
    cities = [];
    generals = [];
}
function rewriteGame() {
    var deads = document.getElementsByClassName("dead");
    for (var _i = 0, deads_1 = deads; _i < deads_1.length; _i++) {
        var dead = deads_1[_i];
        for (var key in isAlive)
            if (dead.children[1].classList.contains(isAlive[key]))
                isAlive[key] = false;
    }
    var gameMap = document.getElementById("gameMap").children[0];
    var X = gameMap.children.length;
    var Y = gameMap.children[0].children.length;
    for (var _a = 0, generals_1 = generals; _a < generals_1.length; _a++) {
        var general = generals_1[_a];
        var pos = gameMap.children[general.x].children[general.y];
        if (!isAlive[general.color]) {
            pos.classList.remove("general", general.color);
            cities.push({ x: general.x, y: general.y });
        }
        else if (!pos.classList.contains("city") && !pos.classList.contains("general")) {
            pos.classList.add("general", general.color, "selected");
        }
    }
    for (var _b = 0, cities_1 = cities; _b < cities_1.length; _b++) {
        var city = cities_1[_b];
        var pos = gameMap.children[city.x].children[city.y];
        if (!pos.classList.contains("city") && pos.classList.contains("obstacle")) {
            pos.classList.add("city");
            pos.classList.remove("obstacle");
        }
    }
    cities = [];
    generals = [];
    for (var x = 0; x < X; ++x) {
        for (var y = 0; y < Y; ++y) {
            var pos = gameMap.children[x].children[y];
            if (pos.classList.contains("city")) {
                cities.push({ x: x, y: y });
            }
            else if (pos.classList.contains("general")) {
                var color = getColor(pos);
                if (isAlive[color])
                    generals.push({ x: x, y: y, color: color });
            }
        }
    }
    var gameTurns = document.getElementById("turn-counter").textContent;
    gameTurns = gameTurns.match(/\d+/g)[0];
    var playerInfo = document.getElementById("game-leaderboard").children[0].children;
    for (var i = 1, cur = void 0; i < playerInfo.length; ++i) {
        cur = playerInfo[i].children[1].className.split(' ')[1];
        var army = Number(playerInfo[i].children[2].textContent);
        var delta = army - lastGame[cur];
        if (delta != 0) {
            if (Number(gameTurns) % 25 != 0 && delta > 0)
                playerInfo[i].children[4].textContent = delta.toString();
            playerInfo[i].children[5].textContent = delta.toString();
            lastGame[cur] = army;
        }
    }
}
function getColor(pos) {
    for (var _i = 0, GeneralsIOColors_2 = GeneralsIOColors; _i < GeneralsIOColors_2.length; _i++) {
        var color = GeneralsIOColors_2[_i];
        if (pos.classList.contains(color))
            return color;
    }
    return "meow";
}
startObserve();
