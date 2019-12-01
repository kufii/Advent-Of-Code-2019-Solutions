import m from 'mithril';

export default () => ({
  view: ({ attrs: { options, onselect, selected } }) =>
    m(
      'select',
      {
        onchange: ({ target: t }) => onselect(t.options[t.selectedIndex].value)
      },
      options.map(opt =>
        m(
          'option',
          {
            value: (opt.value == null ? opt : opt.value).toString(),
            selected: (opt.value == null ? opt : opt.value).toString() === selected.toString()
          },
          opt.text || opt
        )
      )
    )
});
