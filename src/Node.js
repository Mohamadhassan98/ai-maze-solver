export default class MapNode {
    constructor(status, x, y, hasAgent = false) {
        this.status = status;
        this.x = x;
        this.y = y;
        this.hasAgent = hasAgent;
    }
}

export function equals(a, b) {
    if (!a && !b) return true;
    if (!a || !b) return false;
    return a.x === b.x && a.y === b.y;
}