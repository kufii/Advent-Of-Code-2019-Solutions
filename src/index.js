import m from 'mithril';
import App from './app';
import z from 'zaftig';

z.setDebug(true);

m.mount(document.body, App);
