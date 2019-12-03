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

const unKey = key => [key.split(',').map(Number)].map(([x, y]) => ({ x, y }))[0];

const DIRS = {
  U: { x: 0, y: 1 },
  D: { x: 0, y: -1 },
  L: { x: -1, y: 0 },
  R: { x: 1, y: 0 }
};

const getPoints = wire => {
  const arr = [];
  const pos = { x: 0, y: 0 };
  wire.forEach(({ direction, distance }) =>
    nTimes(distance, () => {
      const { x, y } = DIRS[direction];
      pos.x += x;
      pos.y += y;
      arr.push(key(pos));
    })
  );
  return arr;
};

const getIntersections = wires => {
  const sets = wires.map(w => new Set(w));
  return wires[0].filter(value => sets.every(w => w.has(value))).map(unKey);
};

const getManhattanDistance = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

const getTravelDistance = (wire, point) => wire.indexOf(key(point)) + 1;

export default {
  part1: () =>
    'Shortest Manhattan distance to an intersection: ' +
    Math.min(
      ...getIntersections(parseInput().map(getPoints)).map(point =>
        getManhattanDistance(point, { x: 0, y: 0 })
      )
    ),
  part2() {
    const wires = parseInput();
    const points = wires.map(getPoints);
    return (
      'Shortest path to an intersection: ' +
      Math.min(
        ...getIntersections(points).map(point =>
          points.reduce((acc, wire) => acc + getTravelDistance(wire, point), 0)
        )
      )
    );
  }
};
