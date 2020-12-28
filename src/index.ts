import { runBot } from './bot';
import { runRenderer } from './renderer';

runBot().catch(error => console.error('error while running bot', error));
runRenderer().catch(error => console.error('error while running bot', error));

