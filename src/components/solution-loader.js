import m from 'mithril';
import z from 'zaftig';
import Select from './select';
import solutions from '../solutions';
import { isGenerator } from '../types';

export default () => {
  let day = localStorage.getItem('day') || 0;
  let visualize = true;
  let loading = false;
  let output = '';
  let canvasVisible = false;

  let interval;
  let intervalRunning = false;
  let generator;
  let generatorInput = '';

  const clearOutput = () => {
    output = '';
    canvasVisible = false;
  };

  const stopInterval = () => {
    clearInterval(interval);
    intervalRunning = false;
    generator = null;
    generatorInput = '';
  };

  const outputErr = err => {
    stopInterval();
    clearOutput();
    output = 'Error';
    loading = false;
    console.error(err);
    m.redraw();
  };

  const scrollToBottom = () =>
    setTimeout(() => {
      const div = document.querySelector('#output');
      div.scrollTop = div.scrollHeight;
    }, 0);

  const runGenerator = gen => {
    const data = gen();
    clearOutput();

    const next = input => {
      try {
        const { value, done } = data.next(input);
        if (generator && value === 'interval') {
          generator = null;
          interval = setInterval(next, solutions[day].interval || 0);
          intervalRunning = true;
        } else {
          done ? stopInterval() : (output = value && value.toString());
          m.redraw();
          if (solutions[day].autoScroll) scrollToBottom();
        }
      } catch (err) {
        outputErr(err);
      }
    };
    if (solutions[day].input) {
      generator = (function*() {
        let input;
        while (true) {
          next(input);
          input = yield;
        }
      })();
      generator.next();
    } else {
      interval = setInterval(next, solutions[day].interval || 0);
      intervalRunning = true;
    }
  };

  const load = fn => {
    stopInterval();
    clearOutput();
    loading = true;
    m.redraw();
    setTimeout(() => {
      try {
        Promise.resolve(fn(visualize))
          .then(data => {
            loading = false;
            if (isGenerator(data)) {
              runGenerator(data);
            } else if (data.canvasRender) {
              canvasVisible = true;
              data.canvasRender(document.querySelector('#canvas'));
              output = data.message;
            } else {
              output = data.toString();
            }
          })
          .then(m.redraw)
          .catch(outputErr);
      } catch (err) {
        outputErr(err);
      }
    }, 0);
  };

  const changeDay = newDay => {
    stopInterval();
    day = newDay;
    localStorage.setItem('day', day);
    clearOutput();
  };

  const loadButton = (text, onclick) =>
    m(
      'button.pure-button.pure-button-primary' + z`m 4 2`,
      {
        type: 'button',
        disabled: loading,
        onclick
      },
      text
    );

  const sendGeneratorInput = () => {
    generator.next(generatorInput);
    generatorInput = '';
    scrollToBottom();
  };

  return {
    view: () =>
      m(
        'div' +
          z`
          text-align center
          display flex
          flex-flow column
          overflow hidden
        `,
        [
          m(
            'form.pure-form',
            m('fieldset', [
              m('label', 'Day: '),
              m(Select, {
                options: solutions.map((_, index) => ({
                  value: index,
                  text: `Day ${index + 1}`
                })),
                selected: day,
                onselect: changeDay
              }),
              m('div', { hidden: !solutions[day] || !solutions[day].visualize }, [
                m('label.pure-checkbox', [
                  'Visualize ',
                  m('input[type=checkbox]', {
                    oninput: ({ target: t }) => (visualize = t.checked),
                    checked: visualize
                  })
                ])
              ]),
              m('div', [
                loadButton('Part 1', () => load(solutions[day].part1)),
                loadButton('Part 2', () => load(solutions[day].part2))
              ]),
              m(
                'div',
                { hidden: !intervalRunning },
                m('button.pure-button', { type: 'button', onclick: stopInterval }, 'Stop!')
              )
            ])
          ),
          m(
            'div#output' +
              z`
              overflow auto
            `,
            [
              m(
                'pre' +
                  z`
                  ff 'Mononoki', monospace, monospace
                  line-height 1.13em
                  padding 5
                  mb 0
                  font-size 1em
                  white-space ${solutions[day].wrap ? 'pre-wrap' : 'pre'}
                `,
                loading ? 'Loading...' : solutions[day].html ? m.trust(output) : output
              ),
              m(
                'canvas#canvas' +
                  z`
                  border 1 solid black
                  image-rendering pixelated
                `,
                { hidden: !canvasVisible }
              )
            ]
          ),
          generator &&
            m(
              'div.pure-form' +
                z`
                d flex
                jc center
              `,
              [
                m('input#textbox' + z`mb 0.3em`, {
                  type: 'text',
                  value: generatorInput,
                  oninput: e => (generatorInput = e.target.value),
                  onkeypress: e => (e.code === 'Enter' && sendGeneratorInput(), true)
                }),
                m(
                  'button.pure-button' + z`mb 0.3em`,
                  { type: 'button', onclick: sendGeneratorInput },
                  'Send'
                )
              ]
            )
        ]
      )
  };
};
