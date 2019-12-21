import input from './input';
import intcode, { parse } from '../intcode';
import { sum, output2dArray } from '../../util';
import dedent from 'dedent';

const neighbors = (x, y) => [
  { x, y: y - 1 },
  { x, y: y + 1 },
  { x: x - 1, y },
  { x: x + 1, y }
];

const getMap = function*() {
  let map = '';
  for (const char of intcode(parse(input))) {
    map += String.fromCodePoint(char);
    yield map.trim();
  }
};

const toArray = map => map.split('\n').map(line => [...line]);

const getCells = function*(grid) {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      yield { x, y, value: grid[y][x] };
    }
  }
};

const getNeighbors = (grid, x, y) => neighbors(x, y).filter(({ x, y }) => grid[y] && grid[y][x]);

const getIntersections = function*(grid) {
  for (const { x, y } of getCells(grid)) {
    if ([{ x, y }, ...getNeighbors(grid, x, y)].every(({ x, y }) => grid[y][x] !== '.'))
      yield { x, y };
  }
};

const getPath = function*(grid) {
  let { value: dir, ...pos } = [...getCells(grid)].find(({ value }) =>
    ['^', 'v', '<', '>'].includes(value)
  );

  const next = dir =>
    ({
      '^': { x: pos.x, y: pos.y - 1 },
      v: { x: pos.x, y: pos.y + 1 },
      '<': { x: pos.x - 1, y: pos.y },
      '>': { x: pos.x + 1, y: pos.y }
    }[dir]);

  const turns = dir =>
    ({
      '^': { L: '<', R: '>' },
      v: { L: '>', R: '<' },
      '<': { L: 'v', R: '^' },
      '>': { L: '^', R: 'v' }
    }[dir]);

  const isScaffold = ({ x, y }) => grid[y] && grid[y][x] === '#';

  while (true) {
    let n = 0;
    while (isScaffold(next(dir))) {
      grid[pos.y][pos.x] = '#';
      pos = next(dir);
      grid[pos.y][pos.x] = dir;
      n++;
      yield;
    }
    if (n > 0) yield n.toString();

    const [code, turn] = Object.entries(turns(dir)).find(([_, dir]) => isScaffold(next(dir))) || [];
    if (!code) break;
    dir = turn;
    grid[pos.y][pos.x] = dir;
    yield code;
  }
};

const compress = str => {
  for (let a = 1; a <= 20; a++) {
    for (let b = 1; b <= 20; b++) {
      for (let c = 1; c <= 20; c++) {
        const matches = {};
        let remaining = str;
        matches.A = remaining.slice(0, a);
        remaining = remaining.replace(new RegExp(matches.A + ',?', 'gu'), '');
        matches.B = remaining.slice(0, b);
        remaining = remaining.replace(new RegExp(matches.B + ',?', 'gu'), '');
        matches.C = remaining.slice(0, c);
        remaining = remaining.replace(new RegExp(matches.C + ',?', 'gu'), '');
        if (!remaining) {
          let compressed = str;
          Object.entries(matches).forEach(
            ([key, value]) => (compressed = compressed.replace(new RegExp(value, 'gu'), key))
          );
          return { compressed, matches };
        }
      }
    }
  }
};

export default {
  part1: visualize =>
    function*() {
      let map;
      for (const m of getMap()) {
        map = m;
        if (visualize) yield map;
      }
      const intersections = [...getIntersections(toArray(map))];
      yield 'Sum of the alignment parameters: ' +
        intersections.map(({ x, y }) => x * y).reduce(sum) +
        (visualize ? '\n\n' + map : '');
    },
  part2: visualize =>
    function*() {
      const map = [...getMap()].pop();
      yield map;

      const moves = [];
      const grid = toArray(map);
      for (const move of getPath(grid)) {
        if (move) moves.push(move);
        if (visualize)
          yield dedent`
            ${moves.join(',')}
            ${output2dArray(grid)}
          `;
      }

      const { compressed, matches } = compress(moves.join(','));
      const inputData = [compressed, ...Object.values(matches), 'n'].join('\n') + '\n';
      const program = parse(input);
      program[0] = 2;
      const dustCollected = [...intcode(program, inputData)].pop();

      yield dedent`
        Dust: ${dustCollected}

        ${moves.join(',')}
        ${Object.entries(matches)
          .map(([key, value]) => `${key}: ${value}`)
          .join('  ')}
        Compressed: ${compressed}
      ` + (visualize ? '\n\n' + output2dArray(grid) : '');
    },
  visualize: true,
  interval: 20
};
