import * as WebSocket from 'ws'
import * as express from 'express';
import * as http from 'http';
import * as net from 'net';
import { Message } from './message';

export class WebSocketServer {
  public static readonly PORT: number = 8080;
  private app: express.Application;
  private server: http.Server;
  private wss: WebSocket.Server;
  private options: WebSocket.ServerOptions;

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
  }

  private config(): void {
    this.options = {
      port: Number(process.env.PORT) || WebSocketServer.PORT,
      server: this.server
    };
  }

  // Main socket handler
  private onConnection(socket: WebSocket, req: http.IncomingMessage): void {
    console.log('New client connected %s`', req.headers['sec-websocket-key']);
    // store socket id for future identification
    (socket as any).id = req.headers['sec-websocket-key'];
    // handle incoming messages
    socket.on('message', (msg: string) => { this.onMessage(socket, msg) });
    socket.on('close', (socket: WebSocket, code: number, reason: string) => { this.onClose(socket, code, reason) });
  }


  // handle protocol upgrade (from http to ws)
  private onUpgrade(request: http.IncomingMessage, socket: net.Socket, upgradeHead: Buffer) {
    this.wss.handleUpgrade(request, socket, upgradeHead, ws => {
      this.wss.emit('connection', ws, request);
    });
  }

  // send data to socket directly
  public sendToSocket(socket: WebSocket, msg: Message): void {
    socket.send(msg.toString())
  }

  // Main service runner
  private listen(): void {
    // start server
    this.server.listen(this.options.port, () => {
      console.log('Running WebSocket Server on port `%s`', this.options.port);
    });
    // listen for socket messages
    this.wss.on('upgrade', (request, socket, head) => { this.onUpgrade(request, socket, head) });
    this.wss.on('connection', (socket: WebSocket, req: http.IncomingMessage) => { this.onConnection(socket, req) });
  }

  // for export
  public getApp(): express.Application {
    return this.app;
  }

  private onClose(socket: WebSocket, code: number, reason: string): void {
    console.log('Disconnected client');
    // TODO: how to close?
  }

  // handle incoming massages
  private onMessage(socket: WebSocket, data: string): void {
    console.log('Incoming message from `%s` : `%s`', (socket as any).id, data);
    // Don't crash the server if message is not json
    try {
      let msg: Message = Message.fromJson(JSON.parse(data));
      msg.doAction(socket);
    } catch (e) {
      console.log(e);
      this.sendToSocket(socket, new Message("error", { 'e': `Unexpected message ${data}, Expecting a valid JSON` }));
    }
  }
}