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
function MyQueue() {
  let Node = function (x) {
    this.x = x;
    this.next = null;
  };
  let length = 0, begin, end;
  this.push = function (x) {
    let node = new Node(x), temp;
    if (length == 0) {
      begin = node;
    }
    else {
      temp = end;
      temp.next = node;
    }
    end = node;
    ++length;
  };
  this.pop = function () {
    let temp = begin;
    begin = begin.next;
    length--;
    temp.next = null;
    return temp;
  };
  this.size = function () {
    return length;
  };
  this.front = function () {
    return begin;
  };
  this.back = function () {
    return end;
  };
  this.clear = function () {
    begin = null;
    end = null;
    length = 0;
    return true;
  };
}
