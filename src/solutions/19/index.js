import input from './input';
import intcode, { parse } from '../intcode';
import { makeArray, output2dArray, InfiniteGrid, nestedLoop } from '../../util';

const MAP = {
  0: '.',
  1: '▓'
};

const getCoordinate = (x, y) => MAP[[...intcode(parse(input), [x, y])].pop()];

export default {
  part1: visualize =>
    function*() {
      const map = makeArray(50, 50, ' ');
      let count = 0;
      for (const [x, y] of nestedLoop(2, 0, [map[0].length - 1, map.length - 1])) {
        map[y][x] = getCoordinate(x, y);
        if (map[y][x] === MAP[1]) count++;
        if (visualize) yield output2dArray(map);
      }
      yield '# of points affected by tractor beam: ' +
        count +
        (visualize ? '\n\n' + output2dArray(map) : '');
    },
  part2: () =>
    function*() {
      const grid = new InfiniteGrid(' ');
      const getValue = (x, y) => {
        let value = grid.get(x, y);
        if (value !== ' ') return value;
        value = getCoordinate(x, y);
        grid.set(x, y, value);
        return value;
      };

      const SQUARE = 100;
      let minX = 0;
      let x = 0;
      let y = SQUARE * 2;
      let inBeam = false;
      let xStreak = 0;
      while (true) {
        const value = getValue(x, y);

        if (value === MAP[1]) {
          xStreak++;
          if (xStreak >= SQUARE) {
            const leftX = x - SQUARE + 1;
            const bottomY = y + SQUARE - 1;
            if (getValue(leftX, bottomY) === MAP[1]) {
              return yield `Location ${leftX},${y}: ` + (leftX * 10000 + y);
            }
          }
        }

        if (inBeam && value === MAP[0]) {
          yield 'Searched row # ' + y;
          y += Math.max(SQUARE - xStreak, 1);
          x = minX;
          xStreak = 0;
          inBeam = false;
        } else if (!inBeam && value === MAP[1]) {
          minX = x;
          inBeam = true;
          x++;
        } else x++;
      }
    },
  visualize: true
};
