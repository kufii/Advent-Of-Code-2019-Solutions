import input from './input';
import intcode, { parse } from '../intcode';
import { InfiniteGrid, output2dArray } from '../../util';

const DIRS = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 }
};

const TURN = {
  UP: { 0: 'LEFT', 1: 'RIGHT' },
  DOWN: { 0: 'RIGHT', 1: 'LEFT' },
  LEFT: { 0: 'DOWN', 1: 'UP' },
  RIGHT: { 0: 'UP', 1: 'DOWN' }
};

const COLORS = { 0: '.', 1: '█', '█': 1, '.': 0 };

const run = function*(start, visualize) {
  const pos = { x: 0, y: 0 };
  let dir = 'UP';
  const grid = new InfiniteGrid('.');
  grid.set(0, 0, start);

  const program = intcode(parse(input));
  let value, done;
  let instructions = 0;
  while (!done) {
    ({ value, done } = program.next(COLORS[grid.get(pos.x, pos.y)]));
    if (value == null) continue;

    instructions++;
    if (instructions === 1) {
      grid.set(pos.x, pos.y, COLORS[value]);
      if (visualize) yield grid;
    } else {
      dir = TURN[dir][value];
      const { x, y } = DIRS[dir];
      pos.x += x;
      pos.y += y;
      instructions = 0;
    }
  }
  yield grid;
};

export default {
  part1: visualize =>
    function*() {
      for (const grid of run(COLORS[0], visualize)) {
        yield '# of panels painted: ' +
          grid.cells.length +
          (visualize ? '\n' + output2dArray(grid.toArray()) : '');
      }
    },
  part2: visualize =>
    function*() {
      for (const grid of run(COLORS[1], visualize)) {
        yield output2dArray(grid.toArray());
      }
    },
  visualize: true
};
