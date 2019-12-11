import input from './input';
import { gcd, maxBy, sortBy, output2dArray } from '../../util';
import dedent from 'dedent';

const parseInput = () => input.split('\n').map(line => [...line]);

const toCoords = map => map.flatMap((line, y) => line.map((value, x) => ({ x, y, value })));

const getAsteroids = map => toCoords(map).filter(({ value }) => value === '#');

const getStep = ({ x, y }) => {
  const d = Math.abs(gcd(x, y));
  return { x: x / d, y: y / d };
};

const hasLineOfSight = (map, a, b) => {
  if (a.x === b.x && a.y === b.y) return false;
  const delta = getStep({ x: b.x - a.x, y: b.y - a.y });
  let x = a.x + delta.x;
  let y = a.y + delta.y;
  while (x !== b.x || y !== b.y) {
    if (map[y][x] === '#') return false;
    x += delta.x;
    y += delta.y;
  }
  return true;
};

const getAsteroidsWithLineOfSight = (map, asteroids, a) =>
  asteroids.filter(b => hasLineOfSight(map, a, b));

const getBestLocation = (map, asteroids) =>
  asteroids
    .map(asteroid => ({
      asteroid,
      canSee: getAsteroidsWithLineOfSight(map, asteroids, asteroid)
    }))
    .reduce(maxBy(({ canSee }) => canSee.length));

const getAngle = (a, b) => ((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI + 90 + 360) % 360;

export default {
  part1() {
    const map = parseInput();
    const asteroids = getAsteroids(map);
    const { asteroid, canSee } = getBestLocation(map, asteroids);
    return `# of asteroids that can be detected from ${asteroid.x},${asteroid.y}: ` + canSee.length;
  },
  part2: visualize =>
    function*() {
      let target;
      const map = parseInput();
      let asteroids = getAsteroids(map);
      let { asteroid, canSee } = getBestLocation(map, asteroids);

      const canSeeSorted = () => canSee.sort(sortBy(a => getAngle(asteroid, a)));
      const output = () =>
        `${target.x},${target.y} is the 200th to be vaporized: ${target.x * 100 + target.y}`;

      if (!visualize) {
        target = canSeeSorted()[199];
        return yield output();
      }

      let count = 0;
      while (canSee.length) {
        for (const a of canSeeSorted()) {
          yield output2dArray(map);
          count++;
          target = count === 200 ? a : target;
          map[a.y][a.x] = count === 200 ? 'X' : '.';
        }
        asteroids = getAsteroids(map);
        canSee = getAsteroidsWithLineOfSight(map, asteroids, asteroid);
      }

      yield dedent`
        ${output()}
        ${output2dArray(map)}
      `;
    },
  visualize: true,
  interval: 20
};
