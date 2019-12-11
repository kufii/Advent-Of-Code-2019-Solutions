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

  const clearOutput = () => {
    output = '';
    canvasVisible = false;
  };

  const stopInterval = () => {
    clearInterval(interval);
    intervalRunning = false;
  };

  const outputErr = err => {
    stopInterval();
    clearOutput();
    output = 'Error';
    loading = false;
    console.error(err);
    m.redraw();
  };

  const runGenerator = gen => {
    const data = gen();
    clearOutput();
    interval = setInterval(() => {
      try {
        const { value, done } = data.next();
        done ? stopInterval() : (output = value && value.toString());
        m.redraw();
      } catch (err) {
        outputErr(err);
      }
    }, solutions[day].interval || 0);
    intervalRunning = true;
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

  return {
    view: () =>
      m('div' + z`text-align center; p 1em`, [
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
          'pre' +
            z`
            line-height 1em
            overflow-x auto
            mb 0
          `,
          loading ? 'Loading...' : output
        ),
        m(
          'canvas#canvas' +
            z`
            border 1 solid black
            image-rendering pixelated
          `,
          { hidden: !canvasVisible }
        )
      ])
  };
};
