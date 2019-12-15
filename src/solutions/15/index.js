import input from './input';
import intcode from '../intcode';
import { InfiniteGrid, output2dArray, dijkstra, toPath } from '../../util';

const parseInput = () => input.split(',').map(Number);

const DIRS = {
  NORTH: { code: 1, opposite: 'SOUTH', x: 0, y: -1 },
  SOUTH: { code: 2, opposite: 'NORTH', x: 0, y: 1 },
  WEST: { code: 3, opposite: 'EAST', x: 1, y: 0 },
  EAST: { code: 4, opposite: 'WEST', x: -1, y: 0 }
};

const BLOCKS = {
  0: '█',
  1: '.',
  2: '*'
};

const key = ({ x, y }) => `${x},${y}`;

const unKey = key => [key.split(',').map(Number)].map(([x, y]) => ({ x, y }))[0];

const neighbors = ({ x, y }) => [
  { x, y: y - 1 },
  { x, y: y + 1 },
  { x: x - 1, y },
  { x: x + 1, y }
];

const move = (program, direction) => {
  let value;
  while (value == null) {
    ({ value } = program.next(direction));
  }
  return value;
};

const drawGrid = function*() {
  const program = intcode(parseInput());
  const grid = new InfiniteGrid(' ');
  const pos = { x: 0, y: 0 };
  const steps = [];
  while (true) {
    const dir = Object.values(DIRS).find(d => grid.get(pos.x + d.x, pos.y + d.y) === ' ');
    if (dir) {
      const { code, x, y, opposite } = dir;
      const result = move(program, code);
      grid.set(pos.x + x, pos.y + y, BLOCKS[result]);
      if (result !== 0) {
        pos.x += x;
        pos.y += y;
        steps.push(opposite);
      }
      yield grid;
    } else if (steps.length) {
      const { code, x, y } = DIRS[steps.pop()];
      move(program, code);
      pos.x += x;
      pos.y += y;
    } else return yield grid;
  }
};

const getOxygenSystemLocation = grid => grid.cells.find(({ value }) => value === BLOCKS[2]);

export default {
  part1: visualize =>
    function*() {
      let grid;
      for (const step of drawGrid()) {
        if (visualize) yield output2dArray(step.toArray());
        grid = step;
      }

      const source = key({ x: 0, y: 0 });
      const dest = key(getOxygenSystemLocation(grid));

      const [distances, prev] = dijkstra(
        grid,
        source,
        grid => grid.cells.filter(({ value }) => value !== BLOCKS[0]).map(key),
        (grid, node) =>
          neighbors(unKey(node))
            .filter(({ x, y }) => grid.get(x, y) !== BLOCKS[0])
            .map(key)
      );

      if (visualize) {
        grid.set(0, 0, 'D');
        for (const node of toPath(prev, source, dest)) {
          const { x, y } = unKey(node);
          grid.set(
            x,
            y,
            `<span style="color: red; font-weight: bold">${
              grid.get(x, y) === BLOCKS[1] ? '•' : grid.get(x, y)
            }</span>`
          );
          yield output2dArray(grid.toArray());
        }
      }

      yield 'Distance to oxygen system: ' +
        distances.get(dest) +
        (visualize ? '\n' + output2dArray(grid.toArray()) : '');
    },
  part2: visualize =>
    function*() {
      let grid;
      for (const step of drawGrid()) {
        if (visualize) yield output2dArray(step.toArray());
        grid = step;
      }

      const oxygenSystem = getOxygenSystemLocation(grid);
      const oxygen = new Set([key(oxygenSystem)]);
      const drawOxygen = (x, y) =>
        grid.set(x, y, grid.get(x, y) === BLOCKS[1] ? '•' : grid.get(x, y));
      drawOxygen(oxygenSystem.x, oxygenSystem.y);

      let time = -1;
      const output = () =>
        'Time: ' + time + (visualize ? '\n' + output2dArray(grid.toArray()) : '');

      while (oxygen.size) {
        for (const node of [...oxygen.keys()]) {
          neighbors(unKey(node))
            .filter(({ x, y }) => grid.get(x, y) === BLOCKS[1])
            .forEach(({ x, y }) => (drawOxygen(x, y), oxygen.add(key({ x, y }))));
          oxygen.delete(node);
        }
        time++;
        if (visualize) yield output();
      }

      yield output();
    },
  visualize: true,
  html: true
};
