import input from './input';
import intcode, { parse } from '../intcode';

const run = function*() {
  let value, done;
  const program = intcode(parse(input));
  let output = '';
  while (!done) {
    ({ value, done } = program.next());
    output += String.fromCharCode(value);
    if (output.endsWith('Command?\n')) {
      const input = yield output;
      program.next();
      program.next(input && input.trim() + '\n');
      output = '';
    }
  }
  yield output;
};

export default {
  part1: () =>
    function*() {
      let input;
      let value, done;
      const program = run();
      let output = 'use command "auto" to auto solve';
      while (!done) {
        ({ value, done } = program.next(input));
        output += value;
        input = null;
        while (!input) {
          input = yield output.trim();
          if (input.trim() === 'take infinite loop') {
            output += '\nCan you not?';
            input = null;
          }
        }
      }
    },
  input: true
};
