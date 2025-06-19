function applyAntiACPatch() {
  const backup = Node.prototype.removeChild;

  const wrappedRemoveChild = function <T extends Node>(child: T): T {
    const stack = new Error().stack.split("\n");
    // console.log(stack);

    for (const x of stack) {
      if (x.startsWith("MutationCallback")) {
        if (x.includes("https://generals.io/generals-main-prod-")) {
          // console.debug(
          //     "Attempted to remove a child in a MutationCallback, preventing removal.",
          // );
          return child; // Prevent the removal
        }
      }
    }

    return backup.call(this, child);
  };

  window.wrappedJSObject.Node.prototype.removeChild = exportFunction(
    wrappedRemoveChild,
    window
  );
}

applyAntiACPatch();
