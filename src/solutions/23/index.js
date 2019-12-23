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

export default {
  part1() {
    const computers = getComputers();
    for (let i = 0; i < Infinity; i++) {
      const { program, queue, output } = computers[i % computers.length];
      const { value } = program.next(queue[0] != null ? queue[0] : -1);
      if (value == null) queue.shift();
      else output.push(value);
      if (output.length === 3) {
        const [address, x, y] = output;
        if (address === 255) return 'Y value of first packet to 255: ' + y;
        computers[address].queue.push(x, y);
        computers[i % computers.length].output = [];
      }
    }
  },
  part2() {
    const computers = getComputers();
    let idle = false;
    let nat = [];
    const deliveredByNat = new Set();

    for (let i = 0; i < Infinity; i++) {
      const index = i % computers.length;
      const { program, queue, output } = computers[index];
      const { value } = program.next(queue[0] != null ? queue[0] : -1);

      if (value == null) {
        if (!queue.length && index === 0) idle = true;
        else if (queue.length) idle = false;
        if (idle && index === computers.length - 1) {
          const [x, y] = nat;
          if (deliveredByNat.has(y)) return 'First repeating Y value sent by NAT: ' + y;
          deliveredByNat.add(y);
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
        if (address === 255) nat = [x, y];
        else computers[address].queue.push(x, y);
        computers[index].output = [];
      }
    }
  }
};
