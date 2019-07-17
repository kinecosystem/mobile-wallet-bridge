import * as WebSocket from 'ws'
import * as http from 'http';
import { User } from './model'

export class WebSocketServer {
  public static readonly PORT: number = 3000;
  private server: WebSocket.Server;
  private options: WebSocket.ServerOptions;
  private rooms: Object;

  constructor() {
    this.config();
    this.createServer();
    this.listen();
  }

  private createServer(): void {
    this.server = new WebSocket.Server(this.options);
    this.rooms = {};
    console.log('Running WebSocket server on port %s', this.options.port);
  }

  private config(): void {
    this.options = {
      port: Number(process.env.PORT) || WebSocketServer.PORT
    };
  }

  private onMessage(webSocket: WebSocket, data: WebSocket.Data): void {
    console.log('[server](message): %s', JSON.stringify(data));
    // broadcasting to every other connected WebSocket clients, excluding itself.
    this.server.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(`Broadcasting incoming message: ${data}`);
      }
    });

    // TODO: This is bad...
    if (typeof data === 'string') {
      try {
        let jsonData = JSON.parse(data);
        if (jsonData['join'] !== undefined) {
          this.joinRoom(webSocket, jsonData['join']);
        }
      } catch { }
    }
  }

  private onClose(webSocket: WebSocket, code: number, reason: string): void {
    console.log('Disconnected client');
    // TODO: how to close?
  }

  private joinRoom(webSocket: WebSocket, roomName: string): void {
    console.log(`Client joining Room:[${roomName}]`);
    let serverRoom = this.rooms[roomName];
    if (serverRoom !== undefined) {
      this.rooms[roomName].push(webSocket);
    } else {
      this.rooms[roomName] = [webSocket];
    }
    console.log(this.rooms);
  }

  private onConnection(webSocket: WebSocket | any, req: http.IncomingMessage): void {
    console.log('Connected client - %s - on port %s.', req.connection.remoteAddress, this.options.port);
    webSocket.id = req.headers['sec-websocket-key'];
    webSocket.on('message', (msg: string) => this.onMessage(webSocket, msg));
    webSocket.on('close', (webSocket: WebSocket, code: number, reason: string) => this.onClose(webSocket, code, reason));
  }

  private listen(): void {
    this.server.on('connection', (webSocket: WebSocket, req: http.IncomingMessage) => this.onConnection(webSocket, req));
  }

  public getServer(): WebSocket.Server {
    return this.server;
  }
}