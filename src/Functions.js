import {availableStateColors} from "./App";
import MapNode from "./Node";

export function nextRandom(min = 20, max = 50) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function cloneBoard(start, goal, board) {
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

