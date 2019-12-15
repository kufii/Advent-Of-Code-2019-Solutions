import input from './input';
import intcode from '../intcode';
import { InfiniteGrid, output2dArray, dijkstra } from '../../util';

const parseInput = () => input.split(',').map(Number);

const DIRS = {
  NORTH: { code: 1, opposite: 'SOUTH', x: 0, y: -1 },
  SOUTH: { code: 2, opposite: 'NORTH', x: 0, y: 1 },
  WEST: { code: 3, opposite: 'EAST', x: 1, y: 0 },
  EAST: { code: 4, opposite: 'WEST', x: -1, y: 0 }
};

const BLOCKS = {
  0: '#',
  1: '.',
  2: '*'
};

const key = (x, y) => `${x},${y}`;

const unKey = key => [key.split(',').map(Number)].map(([x, y]) => ({ x, y }))[0];

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
  grid.set(0, 0, '.');
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

const getGraph = grid =>
  grid.cells
    .filter(({ value }) => value !== BLOCKS[0])
    .reduce(
      (acc, { x, y }) => ({
        ...acc,
        [key(x, y)]: [
          { x, y: y - 1 },
          { x, y: y + 1 },
          { x: x - 1, y },
          { x: x + 1, y }
        ]
          .filter(({ x, y }) => [BLOCKS[1], BLOCKS[2]].includes(grid.get(x, y)))
          .map(({ x, y }) => key(x, y))
      }),
      {}
    );

export default {
  part1: visualize =>
    function*() {
      let grid;
      for (const step of drawGrid()) {
        if (visualize) yield output2dArray(step.toArray());
        grid = step;
      }

      const graph = getGraph(grid);
      const source = key(0, 0);
      const dest = grid.cells
        .filter(({ value }) => value === BLOCKS[2])
        .map(({ x, y }) => key(x, y))[0];
      const [distances, prev] = dijkstra(graph, source);

      if (visualize) {
        grid.set(0, 0, 'D');
        let current;
        do {
          current = current ? prev.get(current) : dest;
          const { x, y } = unKey(current);
          grid.set(x, y, `<span style="color: red; font-weight: bold">${grid.get(x, y)}</span>`);
        } while (current !== source);
      }

      yield 'Distance to oxygen system: ' +
        distances.get(dest) +
        (visualize ? '\n' + output2dArray(grid.toArray()) : '');
    },
  visualize: true,
  html: true
};
