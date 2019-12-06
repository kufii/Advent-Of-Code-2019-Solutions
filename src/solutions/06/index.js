import input from './input';
import { sum, dijkstra } from '../../util';

const parseInput = () =>
  input
    .split('\n')
    .map(s => s.split(')'))
    .reduce((acc, [value, key]) => ({ ...acc, [key]: value }), {});

const getNumOrbits = (orbits, name) => (orbits[name] ? 1 + getNumOrbits(orbits, orbits[name]) : 0);

const getGraph = orbits =>
  Object.entries(orbits).reduce((acc, [key, value]) => {
    acc[key] = acc[key] || [];
    acc[value] = acc[value] || [];
    acc[key].push(value);
    acc[value].push(key);
    return acc;
  }, {});

export default {
  part1() {
    const orbits = parseInput();
    return (
      'Total # of orbits: ' +
      Object.keys(orbits)
        .map(name => getNumOrbits(orbits, name))
        .reduce(sum)
    );
  },
  part2: () =>
    '# of orbital transfers to get to the object SAN is orbiting: ' +
    (dijkstra(getGraph(parseInput()), 'YOU')[0].get('SAN') - 2)
};
