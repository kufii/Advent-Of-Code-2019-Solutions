import input from './input';
import intcode, { parse } from '../intcode';
import { dijkstra, getAllSubsets, sortBy } from '../../util';
import dedent from 'dedent';

const run = function*() {
  let value, done;
  const program = intcode(parse(input));
  let output = '';
  while (!done) {
    ({ value, done } = program.next());
    if (value) output += String.fromCharCode(value);
    if (output.endsWith('Command?\n')) {
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
      let output = dedent`
        use command "help" to view a list of commands

        use command "auto" to auto solve
      `;
      let isAuto = false;

      let currentRoom;
      let currentDirections;
      let currentItems;
      let takeableItems;

      const graph = {};
      let path = [];
      let testItems = false;

      const outputCmd = cmd => (output += '\n>' + cmd + '\n');

      const runCmd = cmd => {
        outputCmd(cmd);
        const value = program.next(cmd).value;
        output += value;
        return value;
      };

      const runItemTest = function*() {
        const [direction] = Object.entries(graph[currentRoom]).find(
          ([_, room]) => room === 'Pressure-Sensitive Floor'
        );
        const value = runCmd('inv');
        const match = value.match(/Items in your inventory:\n((?:- [a-z ]+\n)+)/imu);
        const itemsArray = match
          ? match[1]
              .split('\n')
              .filter(Boolean)
              .map(i => i.slice(2).trim())
          : [];
        const items = new Set(itemsArray);
        const droppedItems = new Set();
        yield output.trim();

        const dropItem = item => {
          droppedItems.add(item);
          items.delete(item);
          return runCmd('drop ' + item);
        };

        const takeItem = item => {
          droppedItems.delete(item);
          items.add(item);
          return runCmd('take ' + item);
        };

        const dropItems = function*(items) {
          for (const item of items) {
            dropItem(item);
            yield output.trim();
          }
        };

        const subsets = getAllSubsets(itemsArray)
          .filter(arr => arr.length)
          .sort(sortBy(arr => arr.length));

        while (true) {
          for (const set of subsets) {
            yield* dropItems([...items].filter(i => !set.includes(i)));
            for (const item of set) {
              if (items.has(item)) continue;
              takeItem(item);
              yield output.trim();
            }
            const value = runCmd(direction);
            yield output.trim();
            if (value.match(/Analysis complete! You may proceed\./mu)) return;
          }
        }
      };

      while (!done) {
        ({ value, done } = program.next(input));
        if (!value) break;

        let match = value.match(/== ([a-z- ]+) ==/imu);
        if (match) {
          if (isAuto) {
            graph[currentRoom][input] = match[1];
            if (!graph[match[1]]) graph[match[1]] = {};
            graph[match[1]][OPPOSITES[input]] = currentRoom;
          }

          if (match[1] !== 'Pressure-Sensitive Floor') {
            currentRoom = match[1];
            match = value.match(/Doors here lead:\n((?:- [a-z]+\n)+)/mu);
            currentDirections = match[1]
              .trim()
              .split('\n')
              .map(d => d.slice(2).trim());

            match = value.match(/Items here:\n((?:- [a-z- ]+\n)+)/imu);
            currentItems = takeableItems = match
              ? match[1]
                  .trim()
                  .split('\n')
                  .map(i => i.slice(2).trim())
              : [];
            takeableItems = currentItems.filter(i => !BAD_ITEMS.includes(i));

            isAuto &&
              currentDirections
                .filter(d => !graph[currentRoom][d])
                .forEach(d => (graph[currentRoom][d] = null));
          }
        }

        output += value;
        input = null;

        while (!input) {
          input = yield output.trim();
          input = input && input.trim().toLowerCase();

          if (isAuto) {
            if (!testItems && takeableItems.length) {
              input = 'take ' + takeableItems.pop();
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
                yield* runItemTest();
                return;
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

          if (input) outputCmd(input);
          if (input === 'take infinite loop' && currentItems.includes('infinite loop')) {
            yield 'interval';
            while (true) {
              outputCmd(input);
              yield output.trim();
            }
          } else if (input === 'auto') {
            isAuto = true;
            graph[currentRoom] = currentDirections.reduce((acc, d) => ({ ...acc, [d]: null }), {});
            input = '';
            yield 'interval';
          } else if (input === 'help') {
            output += dedent`
              Move with commands "north", "east", "south", "west"

              Pickup items with "take <item>"

              Drop items with "drop <item>"

              View inventory with "inv"

              Auto solve with "auto"
            `;
            input = '';
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
