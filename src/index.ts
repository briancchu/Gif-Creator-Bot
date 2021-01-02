import { runBot } from './bot';
import { runRenderer } from './renderer';

runBot()
  .then(() => console.info('bot launched'))
  .catch(error => console.error('error while running bot', error));

runRenderer()
  .then(() => console.info('video creation complete'))
  .catch(error => console.error('error while running bot', error));

