import * as WebSocket from 'ws'
import * as express from 'express';
import * as http from 'http';
import * as net from 'net';
import { User } from './model'

export class WebSocketServer {
  public static readonly PORT: number = 8080;
  private app: express.Application;
  private server: http.Server;
  private wss: WebSocket.Server;
  private options: WebSocket.ServerOptions;
  private rooms: Object;

  constructor() {
    this.createApp();
    this.createServer();
    this.config();
    this.sockets();
    this.listen();
  }
  private createApp(): void {
    this.app = express();
  }

  private createServer(): void {
    this.server = http.createServer(this.app);
  }

  private sockets(): void {
    this.wss = new WebSocket.Server({ server: this.options.server });
    this.rooms = {};
  }

  private config(): void {
    this.options = {
      port: Number(process.env.PORT) || WebSocketServer.PORT,
      server: this.server
    };
  }

  private onMessage(webSocket: WebSocket, data: WebSocket.Data): void {
    console.log('[server](message): %s', JSON.stringify(data));
    // broadcasting to every other connected WebSocket clients, excluding itself.
    this.wss.clients.forEach((client) => {
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

  private onUpgrade(request: http.IncomingMessage, socket: net.Socket, upgradeHead: Buffer) {
    this.wss.handleUpgrade(request, socket, upgradeHead, ws => {
      this.wss.emit('connection', ws, request);
    });
  }

  private listen(): void {
    this.server.listen(this.options.port, () => {
      console.log('Running HTTP Server on port %s', this.options.port);
      console.log('Running WebSocket Server on port %s', this.options.port);
    });
    this.wss.on('upgrade', (request, socket, head) => { this.onUpgrade(request, socket, head) });
    this.wss.on('connection', (webSocket: WebSocket, req: http.IncomingMessage) => this.onConnection(webSocket, req));
  }

  public getApp(): express.Application {
    return this.app;
  }
}