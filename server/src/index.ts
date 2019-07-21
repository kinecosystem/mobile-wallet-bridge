import { WebSocketServer } from './service/server';

let app = new WebSocketServer().getApp();
export { app };
