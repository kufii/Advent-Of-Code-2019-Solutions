import input from './input';
import { makeArray, output2dArray, sum, sortBy } from '../../util';
import dedent from 'dedent';

const parseInput = () => input.split('\n').map(line => [...line]);

const iterate = function*(arr) {
  for (let y = 0; y < arr.length; y++) {
    for (let x = 0; x < arr[y].length; x++) {
      yield { x, y, value: arr[y][x] };
    }
  }
};

const neighbors = (x, y) => [
  { x: x - 1, y },
  { x: x + 1, y },
  { x, y: y - 1 },
  { x, y: y + 1 }
];

const getBioDiversityRating = arr =>
  [...arr.map(line => line.join('')).join('')].map((c, i) => (c === '#' ? 2 ** i : 0)).reduce(sum);

const createLevel = () => {
  const array = makeArray(5, 5, '.');
  array[2][2] = '?';
  return array;
};

export default {
  part1: visualize =>
    function*() {
      let array = parseInput();

      const history = new Set();
      while (true) {
        const output = output2dArray(array);
        if (history.has(output))
          return yield dedent`
          Biodiversity rating: ${getBioDiversityRating(array)}
          ${output}
        `;
        history.add(output);

        if (visualize) yield output;

        const nextState = makeArray(5, 5, '.');
        for (let y = 0; y <= 4; y++) {
          for (let x = 0; x <= 4; x++) {
            const value = array[y][x];
            const bugs = neighbors(x, y).filter(({ x, y }) => array[y] && array[y][x] === '#');
            const newValue =
              (value === '#' && bugs.length === 1) ||
              (value === '.' && [1, 2].includes(bugs.length))
                ? '#'
                : '.';
            nextState[y][x] = newValue;
          }
        }

        array = nextState;
      }
    },
  part2: visualize =>
    function*() {
      const start = parseInput();
      start[2][2] = '?';
      let depths = {
        '1': createLevel(),
        '0': start,
        '-1': createLevel()
      };

      const getVisualization = () =>
        Object.entries(depths)
          .sort(sortBy(([depth]) => Number(depth)))
          .map(
            ([depth, array]) => dedent`
              Depth ${depth}
              ${output2dArray(array)}
            `
          )
          .join('\n\n');

      for (let time = 0; time < 200; time++) {
        const nextState = {};

        Object.entries(depths).forEach(([depth, array]) => {
          nextState[depth] = nextState[depth] || createLevel();
          depth = Number(depth);

          [...iterate(array)]
            .filter(({ value }) => value !== '?')
            .forEach(({ x, y }) => {
              const value = array[y][x];

              const bugs = neighbors(x, y).flatMap(n => {
                if (n.y < 0 || n.x < 0 || n.y > 4 || n.x > 4) {
                  const nextLevel = depths[depth - 1];
                  if (!nextLevel) return [];
                  const value =
                    n.x === -1
                      ? nextLevel[2][1]
                      : n.y === -1
                      ? nextLevel[1][2]
                      : n.x === 5
                      ? nextLevel[2][3]
                      : n.y === 5
                      ? nextLevel[3][2]
                      : '.';
                  return value === '#' ? ['#'] : [];
                }
                const value = array[n.y][n.x];
                return value === '#'
                  ? ['#']
                  : value === '.'
                  ? []
                  : depths[depth + 1]
                  ? [...iterate(depths[depth + 1])].filter(
                      c =>
                        c.value === '#' &&
                        (x === 1
                          ? c.x === 0
                          : x === 3
                          ? c.x === 4
                          : y === 1
                          ? c.y === 0
                          : y === 3
                          ? c.y === 4
                          : false)
                    )
                  : [];
              });

              const newValue =
                (value === '#' && bugs.length === 1) ||
                (value === '.' && [1, 2].includes(bugs.length))
                  ? '#'
                  : '.';

              if (newValue === '#') {
                nextState[depth - 1] = nextState[depth - 1] || createLevel();
                nextState[depth + 1] = nextState[depth + 1] || createLevel();
              }

              nextState[depth][y][x] = newValue;
            });
        });
        depths = nextState;
        if (visualize) yield getVisualization();
      }

      yield '# of bugs after 200 minutes: ' +
        Object.entries(depths).flatMap(([_, array]) =>
          array.flatMap(line => line.filter(c => c === '#'))
        ).length +
        (visualize ? '\n\n' + getVisualization() : '');
    },
  visualize: true,
  interval: 50
};
