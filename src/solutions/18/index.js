import input from './input';
import { dijkstra, output2dArray, minBy } from '../../util';
import dedent from 'dedent';

const MAP = {
  '#': '█',
  '.': ' ',
  '@': '@'
};

const parseInput = () => input.split('\n').map(line => [...line].map(c => MAP[c] || c));

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
    .filter(({ x, y }) => map[y][x] !== MAP['#'])
    .map(key);

const getPath = function*(map, robots, yieldEvery = 1000) {
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

  const recursive = function*(lastKeys, keys, distance = 0) {
    const remainingKeys = Object.keys(pathsBetween).filter(k => !keys.includes(k));
    if (!remainingKeys.length) return yield [distance, keys];

    const memoKey = `${lastKeys.sort().join(',')}:${remainingKeys.sort().join(',')}`;
    if (memo[memoKey]) {
      const [memoDist, memoKeys] = memo[memoKey];
      return yield [distance + memoDist, [...keys, ...memoKeys]];
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

    const results = [];
    for (let i = 0; i < robots.length; i++) {
      for (const value of remainingKeys.filter(value => canTraversePath(lastKeys[i], value))) {
        const [dist] = pathsBetween[lastKeys[i]][value];
        const nextKeys = lastKeys.slice();
        nextKeys[i] = value;
        let result;
        for (const out of recursive(nextKeys, [...keys, value], distance + dist)) {
          result = out;
          yield;
        }
        results.push(result);
      }
    }

    const result = results.reduce(minBy(([dist]) => dist));
    memo[memoKey] = [
      result[0] - distance,
      result[1].slice(Math.max(...lastKeys.map(key => result[1].indexOf(key))) + 1)
    ];

    yield result;
  };

  const robotLocations = robots.map((_, i) => 'start' + i);
  let keyPath;
  let i = 0;
  for (const out of recursive(robotLocations, robotLocations)) {
    i++;
    if (i % yieldEvery === 0) yield;
    keyPath = out && out[1];
  }

  const path = [];
  for (const step of keyPath.slice(robots.length)) {
    const robot = robots.map((_, i) => i).find(i => pathsBetween[robotLocations[i]][step][1]);
    path.push(
      ...pathsBetween[robotLocations[robot]][step][1]
        .slice(1)
        .map(unKey)
        .map(({ x, y }) => ({ x, y, robot }))
    );
    robotLocations[robot] = step;
  }
  yield path;
};

const output = function*(map, robots, path, visualize) {
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
    yield getVisualization().trim();
    for (const { x, y, robot } of path) {
      map[robots[robot].y][robots[robot].x] = MAP['.'];
      if (map[y][x].match(/[a-z]/u)) keys.push(map[y][x]);
      map[y][x] = MAP['@'];
      robots[robot].x = x;
      robots[robot].y = y;
      yield getVisualization().trim();
    }
  }
  yield 'Distance of shortest path: ' + path.length + getVisualization();
};

export default {
  part1: visualize =>
    function*() {
      yield 'Loading... This takes a while...';

      const map = parseInput();
      const cells = [...getCells(map)];
      const pos = cells.find(({ value }) => value === MAP['@']);
      let path;
      for (const out of getPath(map, [pos])) {
        yield 'Loading... This takes a while...';
        path = out;
      }

      for (const out of output(map, [pos], path, visualize)) {
        yield out;
      }
    },
  part2: visualize =>
    function*() {
      yield 'Loading... This takes a while...';

      const map = parseInput();
      const cells = [...getCells(map)];
      const { x, y } = cells.find(({ value }) => value === MAP['@']);
      [{ x, y }, ...neighbors({ x, y })].forEach(({ x, y }) => (map[y][x] = MAP['#']));
      const robots = [
        { x: x - 1, y: y - 1 },
        { x: x + 1, y: y - 1 },
        { x: x - 1, y: y + 1 },
        { x: x + 1, y: y + 1 }
      ];
      robots.forEach(({ x, y }) => (map[y][x] = MAP['@']));

      let path;
      for (const out of getPath(map, robots)) {
        yield 'Loading... This takes a while...';
        path = out;
      }

      for (const out of output(map, robots, path, visualize)) {
        yield out;
      }
    },
  visualize: true,
  interval: 30
};
