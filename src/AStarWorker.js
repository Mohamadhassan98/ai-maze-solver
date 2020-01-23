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

    function newNode(status, x, y, parent) {
        return {status: status, x: x, y: y, parent: parent};
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
        const startNode = newNode(statusStart, startX, startY);
        const goalNode = newNode(statusGoal, goalX, goalY);
        const nodes = [];
        board.forEach(value => {
            const row = [];
            value.forEach(node => {
                const {x: nodeX, y: nodeY, status} = node;
                row.push(newNode(status, nodeX, nodeY));
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
        return Math.hypot((node.x - goal.x), (node.y - goal.y));
    }

    function lowestValueAndKey(obj) {
        let min;
        for (let m of obj) {
            min = m;
            break;
        }
        for (let m of obj) {
            if (m[1] < min[1]) {
                min = m;
            }
        }
        return min;
    }

    function aStarSearch(start, goal, board, expanded) {
        const frontier = new Map();
        frontier.set(start, calculateFValue(start, goal));
        while (true) {
            if (frontier.size === 0) {
                return [];
            }
            const bestChoice = lowestValueAndKey(frontier)[0];
            frontier.delete(bestChoice);
            expanded.count = expanded.count + 1;
            if (equals(bestChoice, goal)) {
                return computeRoutingToStart(bestChoice)[0];
            }
            const possibleMoves = findPossibleMovesAndExpand(bestChoice, board);
            outer: for (let k = 0; k < possibleMoves.length; k++) {
                const move = possibleMoves[k];
                for (let value1 of frontier.values()) {
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
            possibleMoves.push(newNode(empty, x + 1, y, node));
        if (y + 1 !== 20 && board[x][y + 1].status !== block)
            possibleMoves.push(newNode(empty, x, y + 1, node));
        if (x - 1 !== -1 && board[x - 1][y].status !== block)
            possibleMoves.push(newNode(empty, x - 1, y, node));
        if (y - 1 !== -1 && board[x][y - 1].status !== block)
            possibleMoves.push(newNode(empty, x, y - 1, node));
        return possibleMoves;
    }
};