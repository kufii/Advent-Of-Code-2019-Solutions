import input from './input';
import { dijkstra, output2dArray } from '../../util';

const MAP = {
  '#': '▓',
  '.': '.',
  '@': '@'
};

const parseInput = () =>
  input
    .split('\n')
    .filter(Boolean)
    .map(line => [...line].map(c => MAP[c] || c));

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

const isPath = c => c && c === MAP['.'];

const getPortals = map => {
  const cells = [...getCells(map)];
  const portalTiles = cells.filter(({ value }) => isPortal(value));

  const portals = new Set();
  portalTiles.forEach(({ x, y, value }) => {
    let name;
    let location;
    let isOuter = x === 0 || x === map[y].length - 1 || y === 0 || y === map.length - 1;
    if (isPortal(map[y][x - 1])) {
      name = map[y][x - 1] + value;
      location = { x: isPath(map[y][x - 2]) ? x - 2 : x + 1, y };
      isOuter = isOuter || x - 1 === 0;
    } else if (isPortal(map[y][x + 1])) {
      name = value + map[y][x + 1];
      location = { x: isPath(map[y][x + 2]) ? x + 2 : x - 1, y };
      isOuter = isOuter || x + 1 === map[y].length - 1;
    } else if (map[y - 1] && isPortal(map[y - 1][x])) {
      name = map[y - 1][x] + value;
      location = { x, y: map[y - 2] && isPath(map[y - 2][x]) ? y - 2 : y + 1 };
      isOuter = isOuter || y - 1 === 0;
    } else if (map[y + 1] && isPortal(map[y + 1][x])) {
      name = value + map[y + 1][x];
      location = { x, y: map[y + 2] && isPath(map[y + 2][x]) ? y + 2 : y - 1 };
      isOuter = isOuter || y + 1 === map.length - 1;
    }
    portals.add(`${name}:${location.x},${location.y}:${isOuter}`);
  });

  return [...portals.keys()].reduce((acc, key) => {
    const [name, location, isOuter] = key.split(':');
    acc[name] = acc[name] || [];
    acc[name].push({ location, isOuter: isOuter === 'true' });
    return acc;
  }, {});
};

const getWarps = portals =>
  Object.entries(portals)
    .flatMap(([name, locations]) =>
      locations.map(from => ({
        from: from.location,
        to: portals[name].find(l => from.location !== l.location)
      }))
    )
    .filter(({ to }) => to)
    .reduce((acc, { from, to }) => ({ ...acc, [from]: to }), {});

const em = str => `<span style="color: red; font-weight: bold;">${str}</span>`;

export default {
  part1: visualize =>
    function*() {
      const map = parseInput();
      const portals = getPortals(map);
      const warps = getWarps(portals);

      const [distance, path] = dijkstra(
        map,
        portals.AA[0].location,
        portals.ZZ[0].location,
        (map, k) => [
          ...neighbors(unKey(k))
            .filter(({ x, y }) => isPath(map[y][x]))
            .map(key),
          ...[warps[k] && warps[k].location].filter(Boolean)
        ]
      );

      if (visualize) {
        let { x, y } = unKey(portals.AA[0].location);
        map[y][x] = em(MAP['@']);
        yield output2dArray(map);

        for (const step of path) {
          map[y][x] = '.';
          ({ x, y } = unKey(step));
          map[y][x] = em(MAP['@']);
          yield output2dArray(map);
        }
      }

      yield 'Steps to get from AA to ZZ: ' +
        distance +
        (visualize ? '\n\n' + output2dArray(map) : '');
    },
  part2: visualize =>
    function*() {
      const map = parseInput();
      const portals = getPortals(map);
      const warps = getWarps(portals);

      const [distance, path] = dijkstra(
        map,
        portals.AA[0].location + ':0',
        portals.ZZ[0].location + ':0',
        (map, k) => {
          let [location, floor] = k.split(':');
          floor = Number(floor);
          return [
            ...neighbors(unKey(location))
              .filter(({ x, y }) => isPath(map[y][x]))
              .map(k => key(k) + ':' + floor),
            ...[warps[location]]
              .filter(Boolean)
              .filter(({ isOuter }) => !(!isOuter && floor === 0))
              .map(({ location, isOuter }) => location + ':' + (isOuter ? floor + 1 : floor - 1))
          ];
        }
      );

      let floor = 0;
      const output = () => 'Floor: ' + floor + '\n\n' + output2dArray(map);

      if (visualize) {
        const aa = unKey(portals.AA[0].location);
        const zz = unKey(portals.ZZ[0].location);

        let { x, y } = unKey(portals.AA[0].location);
        map[y][x] = em(MAP['@']);

        yield output();

        for (const step of path) {
          map[y][x] = '.';
          const [loc, f] = step.split(':');
          floor = Number(f);
          ({ x, y } = unKey(loc));
          map[y][x] = em(MAP['@']);
          map[aa.y][aa.x] = map[zz.y][zz.x] = MAP[floor === 0 ? '.' : '#'];
          yield output();
        }
      }

      yield 'Steps to get from AA to ZZ: ' + distance + (visualize ? '\n\n' + output() : '');
    },
  visualize: true,
  interval: 20,
  html: true
};
