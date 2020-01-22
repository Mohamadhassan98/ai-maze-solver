export default () => {
    // eslint-disable-next-line no-restricted-globals
    self.addEventListener('message', (event) => {
        const t0 = performance.now();
        let expanded = {count: 0};
        const start = event.data[0];
        const goal = event.data[1];
        const board = event.data[2];
        console.log('BFS started.');
        const result = startBFSSearch(start, goal, board, expanded);
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


    function startBFSSearch(start, goal, board, expanded) {
        const result = cloneBoard(start, goal, board);
        const startNode = result[0];
        const goalNode = result[1];
        const nodes = result[2];
        return findRouteByBFS(startNode, goalNode, nodes, expanded);
    }

    function findRouteByBFS(start, goal, board, expanded) {
        const frontier = [start];
        const exploredNodes = [];
        while (true) {
            if (frontier.length === 0) {
                return null;
            }
            const selectNode = frontier.shift(); // removeAt(0)
            if (equals(selectNode, goal)) {
                return computeRouting(selectNode);
            }
            exploredNodes.push(selectNode);
            expanded.count = expanded.count + 1;
            const possibleMoves = findPossibleMovesAndExpand(selectNode, board);
            outer: for (let i = 0; i < possibleMoves.length; i++) {
                const move = possibleMoves[i];
                for (let j = 0; j < exploredNodes.length; j++) {
                    const explored = exploredNodes[j];
                    if (equals(explored, move)) {
                        continue outer;
                    }
                }
                for (let j = 0; j < frontier.length; j++) {
                    const front = frontier[j];
                    if (equals(front, move)) {
                        continue outer;
                    }
                }
                frontier.push(move);
            }
        }
    }

    function computeRouting(node) {
        const routeToGoal = [node];
        let parentNode = node.parent;
        while (parentNode) {
            routeToGoal.push(parentNode);
            parentNode = parentNode.parent;
        }
        return routeToGoal;
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