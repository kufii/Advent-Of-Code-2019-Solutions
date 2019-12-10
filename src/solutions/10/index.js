import input from './input';

const parseInput = () => input.split('\n').map(line => [...line]);

const toCoords = map => map.flatMap((line, y) => line.map((value, x) => ({ x, y, value })));

const getAsteroids = map => toCoords(map).filter(({ value }) => value === '#');

const gcd = (x, y) => {
  x = Math.abs(x);
  y = Math.abs(y);
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
};

const hasLineOfSight = (map, a, b) => {
  if (a.x === b.x && a.y === b.y) return false;
  const delta = { x: b.x - a.x, y: b.y - a.y };
  const step = { x: 0, y: 0 };
  let n;
  if (delta.y === 0) {
    step.x = delta.x / Math.abs(delta.x);
    n = Math.abs(delta.x);
  } else if (delta.x === 0) {
    step.y = delta.y / Math.abs(delta.y);
    n = Math.abs(delta.y);
  } else {
    n = Math.abs(gcd(delta.x, delta.y));
    step.x = delta.x / n;
    step.y = delta.y / n;
  }
  for (let i = 1; i < n; i++) {
    if (map[a.y + step.y * i][a.x + step.x * i] === '#') return false;
  }
  return true;
};

const getAsteroidsWithLineOfSight = (map, asteroids, a) =>
  asteroids.filter(b => hasLineOfSight(map, a, b));

export default {
  part1() {
    const map = parseInput();
    const asteroids = getAsteroids(map);
    return Math.max(...asteroids.map(a => getAsteroidsWithLineOfSight(map, asteroids, a).length));
  }
};
