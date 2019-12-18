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

const getPath = (map, start) => {
  const keyLocations = [
    ...[...getCells(map)].filter(({ value }) => value.match(/[a-z]/u)),
    { x: start.x, y: start.y, value: 'start' }
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

  const recursive = (lastKey = 'start', distance = 0, keys = ['start']) => {
    const remainingKeys = Object.keys(pathsBetween).filter(k => !keys.includes(k));
    if (!remainingKeys.length) return [distance, keys];

    const memoKey = `${lastKey}:${remainingKeys.sort().join(',')}`;
    if (memo[memoKey]) {
      const [memoDist, memoKeys] = memo[memoKey];
      return [distance + memoDist, [...keys, ...memoKeys]];
    }

    const canTraversePath = (start, end) =>
      !pathsBetween[start][end][1]
        .map(unKey)
        .some(
          ({ x, y }) =>
            (map[y][x] !== end && map[y][x].match(/[a-z]/u) && !keys.includes(map[y][x])) ||
            (map[y][x].match(/[A-Z]/u) && !keys.includes(map[y][x].toLowerCase()))
        );

    const result = remainingKeys
      .filter(value => canTraversePath(lastKey, value))
      .map(value => {
        const [dist] = pathsBetween[lastKey][value];
        return recursive(value, distance + dist, [...keys, value]);
      })
      .reduce(minBy(([dist]) => dist));
    memo[memoKey] = [result[0] - distance, result[1].slice(result[1].indexOf(lastKey) + 1)];

    return result;
  };
  const [distance, keyPath] = recursive();
  const path = [];
  for (let i = 1; i < keyPath.length; i++) {
    path.push(...pathsBetween[keyPath[i - 1]][keyPath[i]][1].slice(1));
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
      const [distance, path] = getPath(map, { x, y });

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
  visualize: true,
  interval: 30
};
