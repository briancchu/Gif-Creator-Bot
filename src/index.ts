import { runBot } from './bot';
import { runRenderer } from './renderer';

runBot()
  .then(() => console.info('bot launched'))
  .catch(error => console.error('error while running bot', error));


