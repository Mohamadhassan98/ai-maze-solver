export default () => {
    // eslint-disable-next-line no-restricted-globals
    self.addEventListener('message', (event) => {
        const t0 = performance.now();
        let expanded = {count: 0};
        const start = event.data[0];
        const goal = event.data[1];
        const board = event.data[2];
        console.log('IDS Started');
        const result = startIDSSearch(start, goal, board, expanded);
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

    function startIDSSearch(start, goal, board, expanded) {
        const result = cloneBoard(start, goal, board);
        const startNode = result[0];
        const goalNode = result[1];
        const nodes = result[2];
        return iterativeDeepeningSearch(startNode, goalNode, nodes, expanded);
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

    function iterativeDeepeningSearch(start, goal, board, expanded) {
        let DFSVisitedNodes = [];

        function findRouteByDepthLimitedSearch(node, limit) {
            expanded.count = expanded.count + 1;
            DFSVisitedNodes.push(node);
            if (equals(goal, node)) {
                return ['success', []];
            } else if (limit === 0) {
                return ['cutoff', []];
            } else {
                let cutoffOccurred = false;
                const possibleMoves = findPossibleMovesAndExpand(node, board);
                outer: for (let i = 0; i < possibleMoves.length; i++) {
                    const move = possibleMoves[i];
                    for (let j = 0; j < DFSVisitedNodes.length; j++) {
                        const visitedNode = DFSVisitedNodes[j];
                        if (equals(visitedNode, move)) {
                            continue outer;
                        }
                    }
                    const variable = findRouteByDepthLimitedSearch(move, limit - 1);
                    const status = variable[0];
                    const result = variable[1];
                    DFSVisitedNodes.pop();
                    if (status === 'cutoff') {
                        cutoffOccurred = true;
                    } else if (status === 'success') {
                        return ['success', [...result, move]];
                    }
                }
                if (cutoffOccurred) {
                    return ['cutoff', []];
                } else {
                    return ['failure', []];
                }
            }
        }

        for (let i = 0; i < 40; i++) {
            const variable = findRouteByDepthLimitedSearch(start, i);
            const state = variable[0];
            const result = variable[1];
            if (state === 'success') {
                return [...result, start];
            } else {
                DFSVisitedNodes = [];
            }
        }
        return [];
    }
};
