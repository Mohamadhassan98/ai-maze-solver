export default class MapNode {
    constructor(status, x, y, parent, hasAgent = false) {
        this.status = status;
        this.x = x;
        this.y = y;
        this.parent = parent;
        this.hasAgent = hasAgent;
    }

}