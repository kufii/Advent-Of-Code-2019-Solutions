import input from './input';
import { dijkstra, output2dArray } from '../../util';

const parseInput = () =>
  input
    .split('\n')
    .filter(Boolean)
    .map(line => [...line]);

const neighbors = ({ x, y }) => [
  { x, y: y - 1 },
  { x, y: y + 1 },
  { x: x - 1, y },
  { x: x + 1, y }
];

const key = ({ x, y }) => `${x},${y}`;

const unKey = key => [key.split(',').map(Number)].map(([x, y]) => ({ x, y }))[0];

const getCells = function*(grid) {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      yield { x, y, value: grid[y][x] };
    }
  }
};

const isPortal = c => c && c.match(/[A-Z]/u);

const isPath = c => c && c === '.';

const getPortals = map => {
  const cells = [...getCells(map)];
  const portalTiles = cells.filter(({ value }) => isPortal(value));

  const portals = new Set();
  portalTiles.forEach(({ x, y, value }) => {
    let name;
    let location;
    if (isPortal(map[y][x - 1])) {
      name = map[y][x - 1] + value;
      location = { x: isPath(map[y][x - 2]) ? x - 2 : x + 1, y };
    } else if (isPortal(map[y][x + 1])) {
      name = value + map[y][x + 1];
      location = { x: isPath(map[y][x + 2]) ? x + 2 : x - 1, y };
    } else if (map[y - 1] && isPortal(map[y - 1][x])) {
      name = map[y - 1][x] + value;
      location = { x, y: map[y - 2] && isPath(map[y - 2][x]) ? y - 2 : y + 1 };
    } else if (map[y + 1] && isPortal(map[y + 1][x])) {
      name = value + map[y + 1][x];
      location = { x, y: map[y + 2] && isPath(map[y + 2][x]) ? y + 2 : y - 1 };
    }
    portals.add(`${name}:${location.x},${location.y}`);
  });

  return [...portals.keys()].reduce((acc, key) => {
    const [name, location] = key.split(':');
    acc[name] = acc[name] || [];
    acc[name].push(location);
    return acc;
  }, {});
};

const getWarps = portals =>
  Object.entries(portals)
    .flatMap(([name, locations]) =>
      locations.map(from => ({
        from,
        to: portals[name].find(l => from !== l)
      }))
    )
    .filter(({ to }) => to)
    .reduce((acc, { from, to }) => ({ ...acc, [from]: to }), {});

const em = str => `<span style="color: red; font-weight: bold;">${str}</span>`;

export default {
  part1: () =>
    function*() {
      const map = parseInput();
      const portals = getPortals(map);
      const warps = getWarps(portals);

      const [distance, path] = dijkstra(map, portals.AA[0], portals.ZZ[0], (map, k) => [
        ...neighbors(unKey(k))
          .filter(({ x, y }) => isPath(map[y][x]))
          .map(key),
        ...[warps[k]].filter(Boolean)
      ]);

      let { x, y } = unKey(portals.AA[0]);
      map[y][x] = em('@');
      yield output2dArray(map);
      console.log(distance, path);
      for (const step of path) {
        map[y][x] = '.';
        ({ x, y } = unKey(step));
        map[y][x] = em('@');
        yield output2dArray(map);
      }

      yield 'Steps to get from AA to ZZ: ' + distance + '\n\n' + output2dArray(map);
    },
  visualize: true,
  interval: 30,
  html: true
};
