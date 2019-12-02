import m from 'mithril';
import z from 'zaftig';
import Select from './select';
import solutions from '../solutions';

export default () => {
  let day = localStorage.getItem('day') || 0;
  let loading = false;
  let output = '';

  const setDay = newDay => {
    day = newDay;
    localStorage.setItem('day', day);
  };

  const load = fn => {
    loading = true;
    m.redraw();
    Promise.resolve(fn())
      .then(data => {
        output = data.toString();
        loading = false;
      })
      .then(m.redraw)
      .catch(err => {
        output = 'Error';
        loading = false;
        console.error(err);
        m.redraw();
      });
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
              onselect: setDay
            }),
            m('div', [
              loadButton('Part 1', () => load(solutions[day].part1)),
              loadButton('Part 2', () => load(solutions[day].part2))
            ])
          ])
        ),
        m(
          'pre' +
            z`
            line-height 1em;
            padding 5px;
            overflow visible;
          `,
          output
        )
      ])
  };
};
