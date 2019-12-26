import input from './input';
import intcode, { parse } from '../intcode';
import { dijkstra } from '../../util';

const run = function*() {
  let value, done;
  const program = intcode(parse(input));
  let output = '';
  while (!done) {
    ({ value, done } = program.next());
    if (value) output += String.fromCharCode(value);
    if (output.endsWith('Command?\n')) {
      console.log([...output].map(c => c.charCodeAt(0)));
      const input = yield output;
      program.next();
      program.next(input && input.trim() + '\n');
      output = '';
    }
  }
  yield output;
};

const BAD_ITEMS = ['infinite loop', 'photons', 'escape pod', 'giant electromagnet', 'molten lava'];

const OPPOSITES = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east'
};

export default {
  part1: () =>
    function*() {
      let input;
      let value, done;
      const program = run();
      let output = 'use command "auto" to auto solve';
      let isAuto = false;

      let currentRoom;
      let currentDirections;
      let takeableItems;

      const graph = {};
      let path = [];
      const items = [];
      let testItems = false;

      while (!done) {
        ({ value, done } = program.next(input));
        if (!value) break;

        let match = value.match(/== ([a-z- ]+) ==/imu);
        if (match) {
          if (isAuto) {
            graph[currentRoom][input] = match[1];
            if (!graph[match[1]]) graph[match[1]] = {};
            if (!graph[match[1]][OPPOSITES[input]]) graph[match[1]][OPPOSITES[input]] = currentRoom;
          }

          currentRoom = match[1];
          match = value.match(/Doors here lead:\n((?:- [a-z]+\n)+)/mu);
          currentDirections = match[1]
            .trim()
            .split('\n')
            .map(d => d.slice(2).trim());
          match = value.match(/Items here:\n((?:- [a-z- ]+\n)+)/mu);
          takeableItems = match
            ? match[1]
                .trim()
                .split('\n')
                .map(i => i.slice(2).trim())
                .filter(i => !BAD_ITEMS.includes(i))
            : [];

          isAuto &&
            currentDirections
              .filter(d => !graph[currentRoom][d])
              .forEach(d => (graph[currentRoom][d] = null));
        }

        output += value;
        input = null;

        while (!input) {
          input = yield output.trim();
          input = input && input.trim().toLowerCase();

          if (isAuto) {
            if (!testItems && takeableItems.length) {
              const item = takeableItems.pop();
              input = 'take ' + item;
              items.push(item);
            } else {
              const [direction] =
                Object.entries(graph[currentRoom]).find(([_, room]) => !room) || [];
              if (direction) {
                input = direction;
                path.push(OPPOSITES[direction]);
              } else if (path.length) {
                input = path.pop();
                if (!input.match(/(north|east|south|west)/u)) {
                  input = Object.entries(graph[currentRoom]).find(([_, room]) => room === input)[0];
                }
              } else if (testItems) {
                const cmd = cmd => {
                  output += '\n>' + cmd + '\n';
                  const value = program.next(cmd).value;
                  output += value;
                  return value;
                };
                const [direction] = Object.entries(graph[currentRoom]).find(
                  ([_, room]) => room === 'Pressure-Sensitive Floor'
                );
                while (items.length) {
                  const drop = items.pop();
                  takeableItems.push(drop);
                  cmd('drop ' + drop);
                  yield output.trim();
                }
                while (true) {
                  const take = takeableItems.pop();
                  items.push(take);
                  cmd('take ' + take);
                  yield output.trim();
                  const value = cmd(direction);
                  yield output.trim();
                  if (value.match(/Analysis complete! You may proceed\./mu)) return;
                  if (
                    value.match(/Alert! Droids on this ship are lighter than the detected value!/mu)
                  ) {
                    const drop = items.pop();
                    cmd('drop ' + drop);
                    yield output.trim();
                  }
                }
              } else {
                path = dijkstra(graph, currentRoom, 'Security Checkpoint', (graph, key) =>
                  Object.values(graph[key])
                )[1]
                  .slice(1)
                  .reverse();
                testItems = true;
              }
            }
          }

          if (input) output += '\n>' + input + '\n';
          if (input === 'take infinite loop') {
            output += '\nCan you not?\n';
            input = null;
          }
          if (input === 'auto') {
            isAuto = true;
            graph[currentRoom] = currentDirections.reduce((acc, d) => ({ ...acc, [d]: null }), {});
            input = '';
            yield 'interval';
          }
        }
      }
    },
  part2: () => 'Advent of Code 2019 Complete!',
  input: true,
  wrap: true,
  interval: 50,
  autoScroll: true
};
