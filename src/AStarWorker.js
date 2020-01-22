export default () => {
    // eslint-disable-next-line no-restricted-globals
    self.addEventListener('message', (event) => {
        const t0 = performance.now();
        let expanded = {count: 0};
        const start = event.data[0];
        const goal = event.data[1];
        const board = event.data[2];
        console.log('A* started.');
        const result = startAStarSearch(start, goal, board, expanded);
        const t1 = performance.now();
        postMessage([result, t1 - t0, expanded.count]);
    });

    class MapNode {
        constructor(status, x, y, parent) {
            this.status = status;
            this.x = x;
            this.y = y;
            this.parent = parent;
        }

    }

    function equals(a, b) {
        if (!a && !b) return true;
        if (!a || !b) return false;
        return a.x === b.x && a.y === b.y;
    }

    const availableStateColors = {
        empty: '#bbb88b',
        goal: '#4caf50',
        start: '#f50057',
        block: '#3f51b5',
    };

    function cloneBoard(start, goal, board) {
        const {start: statusStart, goal: statusGoal} = availableStateColors;
        const {x: startX, y: startY} = start;
        const {x: goalX, y: goalY} = goal;
        const startNode = new MapNode(statusStart, startX, startY);
        const goalNode = new MapNode(statusGoal, goalX, goalY);
        const nodes = [];
        board.forEach(value => {
            const row = [];
            value.forEach(node => {
                const {x: nodeX, y: nodeY, status} = node;
                row.push(new MapNode(status, nodeX, nodeY));
            });
            nodes.push(row);
        });
        return [startNode, goalNode, nodes];
    }

    function startAStarSearch(start, goal, board, expanded) {
        const variable = cloneBoard(start, goal, board);
        const startNode = variable[0];
        const goalNode = variable[1];
        const nodes = variable[2];
        return aStarSearch(startNode, goalNode, nodes, expanded);
    }

    function calculateFValue(node, goal) {
        return calculateHeuristicsValue(node, goal) + computeRoutingToStart(node)[1];
    }

    function calculateHeuristicsValue(node, goal) {
        return Math.hypot((node.x - goal.x), (node.y - goal.y))
    }

    function lowestValueAndKey(obj) {
        const mapSort2 = new Map([...obj.entries()].sort((a, b) => a[1] - b[1]));
        return mapSort2.entries().next().value;
    }

    function aStarSearch(start, goal, board, expanded) {
        const frontier = new Map();
        frontier.set(start, calculateFValue(start, goal));
        while (true) {
            const bestChoice = lowestValueAndKey(frontier)[0];
            frontier.delete(bestChoice);
            expanded.count = expanded.count + 1;
            if (equals(bestChoice, goal)) {
                return computeRoutingToStart(bestChoice)[0];
            }
            const possibleMoves = findPossibleMovesAndExpand(bestChoice, board);
            outer: for (let k = 0; k < possibleMoves.length; k++) {
                const move = possibleMoves[k];
                for (let value1 in frontier.values()) {
                    // noinspection JSUnfilteredForInLoop
                    if (equals(move, value1))
                        continue outer;
                }
                frontier.set(move, calculateFValue(move, goal));
            }
        }
    }

    function computeRoutingToStart(node) {
        const routeNodeToStart = [];
        let gValue = 1;
        routeNodeToStart.push(node);
        let parentNode = node.parent;
        while (parentNode != null) {
            routeNodeToStart.push(parentNode);
            parentNode = parentNode.parent;
            gValue++;
        }
        return [routeNodeToStart, gValue];
    }

    function findPossibleMovesAndExpand(node, board) {
        const {x, y} = node;
        const possibleMoves = [];
        const {block, empty} = availableStateColors;
        if (x + 1 !== 20 && board[x + 1][y].status !== block)
            possibleMoves.push(new MapNode(empty, x + 1, y, node));
        if (y + 1 !== 20 && board[x][y + 1].status !== block)
            possibleMoves.push(new MapNode(empty, x, y + 1, node));
        if (x - 1 !== -1 && board[x - 1][y].status !== block)
            possibleMoves.push(new MapNode(empty, x - 1, y, node));
        if (y - 1 !== -1 && board[x][y - 1].status !== block)
            possibleMoves.push(new MapNode(empty, x, y - 1, node));
        return possibleMoves;
    }
};