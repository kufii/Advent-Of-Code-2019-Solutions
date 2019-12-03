import input from './input';

const parseInput = () =>
  input.split('\n').map(wire =>
    wire
      .split(',')
      .map(move => move.match(/([A-Z])(\d+)/u).slice(1))
      .map(([direction, distance]) => ({ direction, distance: Number(distance) }))
  );

const nTimes = (n, cb) => {
  for (let i = 0; i < n; i++) cb();
};

class InfiniteGrid {
  constructor(fill) {
    this.fill = fill;
    this.grid = new Map();
  }

  key(x, y) {
    return `${x},${y}`;
  }

  set(x, y, value) {
    this.grid.set(this.key(x, y), value);
  }

  get(x, y) {
    return this.grid.has(this.key(x, y)) ? this.grid.get(this.key(x, y)) : this.fill;
  }

  getSetCells() {
    return [...this.grid.entries()]
      .map(([pos, value]) => [...pos.split(',').map(Number), value])
      .map(([x, y, value]) => ({ x, y, value }));
  }
}

const DIRS = {
  U: { x: 0, y: 1, fill: '|' },
  D: { x: 0, y: -1, fill: '|' },
  L: { x: -1, y: 0, fill: '-' },
  R: { x: 1, y: 0, fill: '-' }
};

const getDistance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

const drawWire = (grid, wire) => {
  const pos = { x: 0, y: 0 };
  wire.forEach(({ direction, distance }) => {
    const { x, y, fill } = DIRS[direction];
    nTimes(distance, () => {
      pos.x += x;
      pos.y += y;
      grid.set(pos.x, pos.y, grid.get(pos.x, pos.y) === '.' ? fill : 'X');
    });
    grid.set(pos.x, pos.y, grid.get(pos.x, pos.y) === 'X' ? 'X' : '+');
  });
};

const getIntersections = grid => grid.getSetCells().filter(({ value }) => value === 'X');

const getGrid = wires => {
  const grid = new InfiniteGrid('.');
  grid.set(0, 0, 'o');
  wires.forEach(wire => drawWire(grid, wire));
  return grid;
};

const getDistanceToPoint = (wire, { x, y }) => {
  let steps = 0;
  const pos = { x: 0, y: 0 };
  for (const { direction, distance } of wire) {
    const delta = DIRS[direction];
    for (let n = 0; n < distance; n++) {
      steps++;
      pos.x += delta.x;
      pos.y += delta.y;
      if (pos.x === x && pos.y === y) return steps;
    }
  }
  return NaN;
};

export default {
  part1: () =>
    'Shortest Manhattan distance to an intersection: ' +
    Math.min(
      ...getIntersections(getGrid(parseInput())).map(point => getDistance(point, { x: 0, y: 0 }))
    ),
  part2() {
    const wires = parseInput();
    const grid = getGrid(wires);
    return (
      'Shortest path to an intersection: ' +
      Math.min(
        ...getIntersections(grid)
          .map(point => wires.reduce((acc, wire) => acc + getDistanceToPoint(wire, point), 0))
          .filter(n => !isNaN(n))
      )
    );
  }
};
