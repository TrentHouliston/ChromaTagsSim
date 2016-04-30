import $ from 'jquery';
import { App } from './app';

$(() => {
  const canvas = $('#canvas')[0];
  const app = new App({
    canvas: canvas
  });
  app.createScene().then(() => app.render());
});