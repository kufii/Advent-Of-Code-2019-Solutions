import input from './input';
import { nTimes, sum, lcm } from '../../util';

const parseInput = () =>
  input
    .split('\n')
    .map(line =>
      line
        .match(/<x=(-?\d+), y=(-?\d+), z=(-?\d+)>/u)
        .slice(1)
        .map(Number)
    )
    .map(([x, y, z]) => ({ pos: { x, y, z }, vel: { x: 0, y: 0, z: 0 } }));

const DIMS = ['x', 'y', 'z'];

const applyGravity = moons =>
  moons.forEach(moon =>
    moons
      .filter(m => m !== moon)
      .forEach(other =>
        DIMS.forEach(
          dim =>
            (moon.vel[dim] +=
              moon.pos[dim] < other.pos[dim] ? 1 : moon.pos[dim] > other.pos[dim] ? -1 : 0)
        )
      )
  );

const applyVelocity = moons =>
  moons.forEach(moon => DIMS.forEach(dim => (moon.pos[dim] += moon.vel[dim])));

const update = moons => {
  applyGravity(moons);
  applyVelocity(moons);
};

const getPotentialEnergy = ({ pos }) => DIMS.map(dim => pos[dim]).reduce(sum);

const getKineticEnergy = ({ vel }) => DIMS.map(dim => vel[dim]).reduce(sum);

const getTotalEnergy = moon => getPotentialEnergy(moon) * getKineticEnergy(moon);

const getTimeToRepeat = moons => {
  moons.forEach(moon => (moon.start = { pos: { ...moon.pos }, vel: { ...moon.vel } }));
  const repeat = {};
  for (let i = 1; DIMS.some(dim => !repeat[dim]); i++) {
    update(moons);
    DIMS.filter(
      dim =>
        !repeat[dim] &&
        moons.every(
          moon => moon.pos[dim] === moon.start.pos[dim] && moon.vel[dim] === moon.start.vel[dim]
        )
    ).forEach(dim => (repeat[dim] = i));
  }
  return DIMS.map(d => repeat[d]).reduce(lcm);
};

export default {
  part1() {
    const moons = parseInput();
    nTimes(1000, () => update(moons));
    return 'Total energy after 1000 steps: ' + moons.map(getTotalEnergy).reduce(sum);
  },
  part2: () => 'Steps until first repeat: ' + getTimeToRepeat(parseInput())
};
