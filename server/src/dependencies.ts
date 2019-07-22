import Repository from './repository';
import { WebSocketServer } from './server';

const repository = new Repository();
const server = new WebSocketServer();

export { Repository, WebSocketServer }
export { repository, server }