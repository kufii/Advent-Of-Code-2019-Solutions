import input from './input';
import { chunk, minBy } from '../../util';

const parseInput = () => [...input].map(Number);

const toLayers = (nums, width = 25, height = 6) => chunk(chunk(nums, width), height);

const getNumDigits = (layer, digit) => layer.flat().filter(n => n === digit).length;

const getPixel = (layers, x, y) => {
  for (const layer of layers) {
    const p = layer[y][x];
    if (p !== 2) return p;
  }
  return 2;
};

export default {
  part1() {
    const layers = toLayers(parseInput());
    const layer = layers.reduce(minBy(l => getNumDigits(l, 0)));
    return 'Result for layer with fewest 0s: ' + getNumDigits(layer, 1) * getNumDigits(layer, 2);
  },
  part2: () => ({
    message: 'Password: ',
    canvasRender(canvas) {
      const layers = toLayers(parseInput());
      canvas.width = layers[0][0].length;
      canvas.height = layers[0].length;
      canvas.style.zoom = '400%';

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const drawPoint = (x, y) => ctx.fillRect(x, y, 1, 1);

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const pix = getPixel(layers, x, y);
          if (pix === 0) drawPoint(x, y);
        }
      }
    }
  })
};
