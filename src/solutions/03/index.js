import input from './input';
import { nTimes } from '../../util';

const parseInput = () =>
  input.split('\n').map(wire =>
    wire
      .split(',')
      .map(move => move.match(/([A-Z])(\d+)/u).slice(1))
      .map(([direction, distance]) => ({ direction, distance: Number(distance) }))
  );

const key = ({ x, y }) => `${x},${y}`;

const DIRS = {
  U: { x: 0, y: 1 },
  D: { x: 0, y: -1 },
  L: { x: -1, y: 0 },
  R: { x: 1, y: 0 }
};

const getDistance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

const getPoints = wire => {
  const set = new Set();
  const pos = { x: 0, y: 0 };
  wire.forEach(({ direction, distance }) =>
    nTimes(distance, () => {
      const { x, y } = DIRS[direction];
      pos.x += x;
      pos.y += y;
      set.add(key(pos));
    })
  );
  return set;
};

const getIntersections = wires =>
  [...wires[0].values()]
    .filter(value => wires.every(w => w.has(value)))
    .map(str => str.split(',').map(Number))
    .map(([x, y]) => ({ x, y }));

const getDistanceToPoint = (wire, { x, y }) => {
  let steps = 0;
  const pos = { x: 0, y: 0 };
  for (const { direction, distance } of wire) {
    const delta = DIRS[direction];
    for (let n = 0; n < distance; n++) {
      steps++;
      pos.x += delta.x;
      pos.y += delta.y;
      if (pos.x === x && pos.y === y) return steps;
    }
  }
};

export default {
  part1: () =>
    'Shortest Manhattan distance to an intersection: ' +
    Math.min(
      ...getIntersections(parseInput().map(getPoints)).map(point =>
        getDistance(point, { x: 0, y: 0 })
      )
    ),
  part2() {
    const wires = parseInput();
    const points = wires.map(getPoints);
    return (
      'Shortest path to an intersection: ' +
      Math.min(
        ...getIntersections(points).map(point =>
          wires.reduce((acc, wire) => acc + getDistanceToPoint(wire, point), 0)
        )
      )
    );
  }
};
