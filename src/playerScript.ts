import { PuzzleScript } from "@doriongilmore/codingame-ts-engine/types";

const API: PuzzleScript = { main };
export default API;

type ReadlineFunction = () => string

// specific maze game
type Cell = {
    x: number;
    y: number;
    value: string;
    wall: boolean;
    start: boolean;
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    distance: number;
}

type MazeData = {
    maze: Cell[][],
    startingCell: Cell
}

enum DIRECTION {
    UP = "up",
    DOWN = "down",
    LEFT = "left",
    RIGHT = "right"
}

function distanceToChar(distance: number): string {
    if (distance >= 0 && distance < 10) {
        return distance.toString();
    } else if (distance >= 10 && distance < 36) {
        // "A".charCodeAt(0) === 65
        // distance 10 should render to "A", hence 55 + distance
        return String.fromCharCode(55 + distance);
    }
    return ".";
}

function cellToChar(cell: Cell): string {
    if (cell.wall) { return "#"}
    return distanceToChar(cell.distance);
}

function getNextCell<CellType extends string | Cell>(
    coord:{ x: number, y: number },
    inputs: CellType[][],
    direction: DIRECTION
): CellType {
    const height = inputs.length;
    const width = inputs[0].length;

    let nextCellY: number = coord.y;
    let nextCellX: number = coord.x;

    switch (direction) {
        case DIRECTION.UP: {
            nextCellY = coord.y === 0 ? height - 1 : coord.y - 1;
            break;
        }
        case DIRECTION.DOWN: {
            nextCellY = coord.y + 1 === height ? 0 : coord.y + 1;
            break;
        }
        case DIRECTION.LEFT: {
            nextCellX = coord.x === 0 ? width - 1 : coord.x - 1;
            break;
        }
        case DIRECTION.RIGHT: {
            nextCellX = coord.x + 1 === width ? 0 : coord.x + 1;
            break;
        }
    }
    
    return inputs[nextCellY][nextCellX];
}

function isWall(inputChar: string) {
    return inputChar === "#";
}

function initCell(x: number, y: number, inputs: string[][]): Cell {
    const value: string = inputs[y][x];
    const start: boolean = value === "S";

    const _getNextCell: (dir: DIRECTION) => string = getNextCell.bind(null, {x,y}, inputs);

    const wall = isWall(value);
    const up = !wall && !isWall(_getNextCell(DIRECTION.UP));
    const down = !wall && !isWall(_getNextCell(DIRECTION.DOWN));
    const left = !wall && !isWall(_getNextCell(DIRECTION.LEFT));
    const right = !wall && !isWall(_getNextCell(DIRECTION.RIGHT));

    return {
        x,y,value,start,wall,
        up,down,left,right,
        distance: Infinity,
    };
}

function initMaze(inputs: string[][]): MazeData {
    let startingCell: Cell
    const maze: Cell[][] = []
    const height = inputs.length;
    for (let y = 0; y < height; y++) {
        const mazeRow: Cell[] = [];
        const row = inputs[y]
        const width = row.length;
        for (let x = 0; x < width; x++) {
            const mazeCell = initCell(x,y,inputs);
            if (mazeCell.start) {
                startingCell = mazeCell;
            }
            mazeRow.push(mazeCell)
        }
        maze.push(mazeRow);
    }

    return {
        maze: maze,
        startingCell: startingCell!
    };
}

function shouldWalkThrough(nextDistance: number, nextCell: Cell): boolean {
    const isNotParsedYet = nextCell.distance === Infinity;
    const isCloser = nextCell.distance > nextDistance;

    return isNotParsedYet || isCloser;
}

function addToQueue(queue: Cell[], nextDistance: number, nextCell: Cell) {
    if (shouldWalkThrough(nextDistance, nextCell)) {
        queue.push(nextCell);
    }
}

function walkThroughMaze(maze: Cell[][], distance, queue: Cell[]) {
    const newQueue: Cell[] = [];
    for (const cell of queue) {
        if (shouldWalkThrough(distance, cell)) {
            cell.distance = distance;
            const _getNextCell: (dir: DIRECTION) => Cell = getNextCell.bind(null, cell, maze);
            const _addToQueue: (cell: Cell) => void = addToQueue.bind(null, newQueue, distance);
            cell.up && _addToQueue(_getNextCell(DIRECTION.UP));
            cell.down && _addToQueue(_getNextCell(DIRECTION.DOWN));
            cell.left && _addToQueue(_getNextCell(DIRECTION.LEFT));
            cell.right && _addToQueue(_getNextCell(DIRECTION.RIGHT));
        }
    }
    newQueue.length && walkThroughMaze(maze, distance + 1, newQueue);
}

function getInputs(readline): string[][] {
    const [w, h]: string[] = readline().split(' ');
    // const width: number = parseInt(w, 10);
    const height: number = parseInt(h, 10);
    
    const inputs: string[][] = [];

    for (let i = 0; i < height; i++) {
        const row = readline();
        inputs.push(row.split(""));
    }
    return inputs;
}

function printSolution(maze) {
    const solution: string[] = [];
    for (let i = 0; i < maze.length; i++) {
        const row = maze[i].map(cellToChar).join("");
        solution.push(row);
        console.log(row);
    }
    return solution;
}

function main(readline: ReadlineFunction) {
    const inputs = getInputs(readline);
    const mazeData = initMaze(inputs);
    walkThroughMaze(mazeData.maze, 0, [mazeData.startingCell]);
    return printSolution(mazeData.maze);
}

// main(readline);
