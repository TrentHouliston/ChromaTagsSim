import { App } from './app';

const canvas = document.getElementById('canvas');
const app = new App({
  canvas: canvas
});
app.createScene().then(() => app.render());