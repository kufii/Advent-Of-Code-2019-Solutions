import input from './input';
import { dijkstra, output2dArray, minBy } from '../../util';
import dedent from 'dedent';

const parseInput = () => input.split('\n').map(line => [...line]);

const key = ({ x, y }) => `${x},${y}`;

const unKey = key => [key.split(',').map(Number)].map(([x, y]) => ({ x, y }))[0];

const getCells = function*(grid) {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      yield { x, y, value: grid[y][x] };
    }
  }
};

const neighbors = ({ x, y }) => [
  { x, y: y - 1 },
  { x, y: y + 1 },
  { x: x - 1, y },
  { x: x + 1, y }
];

const getNeighbors = (map, k) =>
  neighbors(unKey(k))
    .filter(({ x, y }) => map[y][x] !== '#')
    .map(key);

const getPath = (map, robots) => {
  const keyLocations = [
    ...[...getCells(map)].filter(({ value }) => value.match(/[a-z]/u)),
    ...robots.map(({ x, y }, i) => ({ x, y, value: 'start' + i }))
  ];
  const pathsBetween = keyLocations.reduce(
    (acc, { x, y, value }) => ({
      ...acc,
      [value]: keyLocations
        .filter(k => !(k.x === x && k.y === y))
        .reduce(
          (acc, k) => ({
            ...acc,
            [k.value]: dijkstra(map, key({ x, y }), key(k), getNeighbors)
          }),
          {}
        )
    }),
    {}
  );

  const memo = {};

  const recursive = (lastKeys, keys, distance = 0) => {
    const remainingKeys = Object.keys(pathsBetween).filter(k => !keys.includes(k));
    if (!remainingKeys.length) return [distance, keys];

    const memoKey = `${lastKeys.sort().join(',')}:${remainingKeys.sort().join(',')}`;
    if (memo[memoKey]) {
      const [memoDist, memoKeys] = memo[memoKey];
      return [distance + memoDist, [...keys, ...memoKeys]];
    }

    const canTraversePath = (start, end) =>
      pathsBetween[start][end][1] &&
      !pathsBetween[start][end][1]
        .map(unKey)
        .some(
          ({ x, y }) =>
            (map[y][x] !== end && map[y][x].match(/[a-z]/u) && !keys.includes(map[y][x])) ||
            (map[y][x].match(/[A-Z]/u) && !keys.includes(map[y][x].toLowerCase()))
        );

    const result = robots
      .flatMap((_, i) =>
        remainingKeys
          .filter(value => canTraversePath(lastKeys[i], value))
          .map(value => {
            const [dist] = pathsBetween[lastKeys[i]][value];
            const nextKeys = lastKeys.slice();
            nextKeys[i] = value;
            return recursive(nextKeys, [...keys, value], distance + dist);
          })
      )
      .reduce(minBy(([dist]) => dist));
    memo[memoKey] = [result[0] - distance, result[1].slice(result[1].indexOf(lastKeys[0]) + 1)];

    return result;
  };
  const startKeys = robots.map((_, i) => 'start' + i);
  const [distance, keyPath] = recursive(startKeys, startKeys);
  const path = [];
  if (robots.length === 1) {
    for (let i = 1; i < keyPath.length; i++) {
      path.push(...pathsBetween[keyPath[i - 1]][keyPath[i]][1].slice(1));
    }
  }
  return [distance, path];
};

export default {
  part1: visualize =>
    function*() {
      yield 'Loading... This takes a while...';

      const map = parseInput();
      const cells = [...getCells(map)];
      let { x, y } = cells.find(({ value }) => value === '@');
      map[y][x] = '.';
      const [distance, path] = getPath(map, [{ x, y }]);

      const keys = [];
      const getVisualization = () =>
        visualize
          ? '\n\n' +
            dedent`
            Keys: ${keys.join(', ')}
            ${output2dArray(map)}
          `
          : '';

      if (visualize) {
        for (const key of path) {
          ({ x, y } = unKey(key));
          if (map[y][x].match(/[a-z]/u)) keys.push(map[y][x]);
          map[y][x] = '@';
          yield getVisualization().trim();
          map[y][x] = '.';
        }
        map[y][x] = '@';
      }

      yield 'Distance of shortest path: ' + distance + getVisualization();
    },
  part2: () =>
    function*() {
      yield 'Loading... This takes a while...';

      const map = parseInput();
      const cells = [...getCells(map)];
      const { x, y } = cells.find(({ value }) => value === '@');
      [{ x, y }, ...neighbors({ x, y })].forEach(({ x, y }) => (map[y][x] = '#'));
      const robots = [
        { x: x - 1, y: y - 1 },
        { x: x + 1, y: y - 1 },
        { x: x - 1, y: y + 1 },
        { x: x + 1, y: y + 1 }
      ];

      yield 'Distance of shortest path: ' + getPath(map, robots)[0];
    },
  visualize: true,
  interval: 30
};
