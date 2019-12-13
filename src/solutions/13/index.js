import input from './input';
import intcode from '../intcode';
import { chunk, InfiniteGrid, output2dArray } from '../../util';

const parseInput = () => input.split(',').map(Number);

const CELLS = {
  0: ' ',
  1: '█',
  2: '#',
  3: '═',
  4: '○'
};

export default {
  part1(visualize) {
    const grid = new InfiniteGrid(0);
    chunk([...intcode(parseInput())], 3).map(([x, y, tile]) => grid.set(x, y, CELLS[tile]));
    return (
      '# of blocks: ' +
      grid.cells.filter(c => c.value === CELLS[2]).length +
      (visualize ? '\n\n' + output2dArray(grid.toArray()) : '')
    );
  },
  part2: visualize =>
    function*() {
      const grid = new InfiniteGrid(CELLS[0]);
      const code = parseInput();
      code[0] = 2;

      let input = 0;
      let value, done;
      let paddleX;
      let ballX;
      const program = intcode(code);
      let instruction = [];
      while (!done) {
        ({ value, done } = program.next(input));
        if (value == null) {
          if (visualize) yield output2dArray(grid.toArray());
          continue;
        }
        instruction.push(value);
        if (instruction.length === 3) {
          const [x, y, tile] = instruction;
          if (tile === 3) paddleX = x;
          if (tile === 4) ballX = x;
          x === -1 ? grid.set(0, -1, tile) : grid.set(x, y, CELLS[tile]);
          input = paddleX < ballX ? 1 : paddleX > ballX ? -1 : 0;
          instruction = [];
        }
      }
      yield 'Score: ' + grid.get(0, -1) + (visualize ? '\n\n' + output2dArray(grid.toArray()) : '');
    },
  visualize: true,
  interval: 40
};
