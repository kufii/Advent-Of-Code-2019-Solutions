import input from './input';
import intcode, { parse } from '../intcode';

const getComputers = () => {
  const computers = [...Array(50)].map((_, i) => ({
    program: intcode(parse(input)),
    queue: [i],
    output: []
  }));
  computers.forEach(c => c.program.next());
  return computers;
};

const run = function*(endEarly) {
  const computers = getComputers();
  let idle = false;
  let nat = [];

  for (let i = 0; i < Infinity; i++) {
    const index = i % computers.length;
    const { program, queue, output } = computers[index];
    const { value } = program.next(queue[0] != null ? queue[0] : -1);

    if (value == null) {
      if (!queue.length && index === 0) idle = true;
      else if (queue.length) idle = false;
      if (idle && index === computers.length - 1) {
        const [x, y] = nat;
        yield y;
        computers[0].queue.push(x, y);
        nat = [];
        idle = false;
      }
      queue.shift();
    } else {
      output.push(value);
      idle = false;
    }

    if (output.length === 3) {
      const [address, x, y] = output;
      if (address === 255) {
        if (endEarly) return yield y;
        nat = [x, y];
      } else computers[address].queue.push(x, y);
      computers[index].output = [];
    }
  }
};

export default {
  part1: () => 'Y value of first packet to 255: ' + [...run(true)].pop(),
  part2() {
    const natHistory = new Set();
    for (const y of run()) {
      if (natHistory.has(y)) return 'First repeating Y value sent by NAT: ' + y;
      natHistory.add(y);
    }
  }
};
