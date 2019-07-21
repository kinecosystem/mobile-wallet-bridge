import * as webSocket from 'ws'
import * as express from 'express';
import * as http from 'http';
import * as net from 'net';

export class WebSocketServer {
  public static readonly PORT: number = 8080;
  private app: express.Application;
  private server: http.Server;
  private wss: webSocket.Server;
  private options: webSocket.ServerOptions;
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
    this.wss = new webSocket.Server({ server: this.options.server });
    this.rooms = {};
  }

  private config(): void {
    this.options = {
      port: Number(process.env.PORT) || WebSocketServer.PORT,
      server: this.server
    };
  }

  private switch(webSocket: any, data: Object) {
    if ('join' in data) {
      this.joinRoom(webSocket, data['join']);
    } else if ('pay' in data) {

    }
  }

  private joinRoom(webSocket: webSocket, roomName: string): void {
    console.log(`Client joining Room: '${roomName}'`);
    let serverRoom = this.rooms[roomName];
    if (serverRoom !== undefined) {
      this.rooms[roomName].push(webSocket);
    } else {
      this.rooms[roomName] = [webSocket];
    }

    webSocket.send(JSON.stringify({ result: 'ok' }));
  }

  private onMessage(webSocket: any, data: string): void {
    console.log('[server](message): %s', data);
    // parse data
    try {
      let msg = JSON.parse(data);
      this.switch(webSocket, msg);
    } catch (e) {
      let err = `Unexpected message "${data}", Expecting a valid JSON`;
      webSocket.send(err);
    }
    // broadcast incoming message to the client room or to everyone if yet to join
    if (webSocket.room !== undefined) {
      for (let client of this.rooms[webSocket.room]) {
        client.send(`Broadcasting incoming message into room [${webSocket.room}]: ${data}`);
      }
    } else {
      for (let client of <any>this.wss.clients) {
        client.send(`Broadcasting incoming message to all client: ${data}`);
      }
    }
  }

  private onClose(webSocket: webSocket, code: number, reason: string): void {
    console.log('Disconnected client');
    // TODO: how to close?
  }



  private onConnection(webSocket: webSocket | any, req: http.IncomingMessage): void {
    console.log('Connected client - %s - on port %s.', req.connection.remoteAddress, this.options.port);
    webSocket.id = req.headers['sec-websocket-key'];
    webSocket.on('message', (msg: string) => this.onMessage(webSocket, msg));
    webSocket.on('close', (webSocket: webSocket, code: number, reason: string) => this.onClose(webSocket, code, reason));
  }

  private onUpgrade(request: http.IncomingMessage, socket: net.Socket, upgradeHead: Buffer) {
    this.wss.handleUpgrade(request, socket, upgradeHead, ws => {
      this.wss.emit('connection', ws, request);
    });
  }

  private listen(): void {
    this.server.listen(this.options.port, () => {
      console.log('Running webSocket Server on port %s', this.options.port);
    });
    this.wss.on('upgrade', (request, socket, head) => { this.onUpgrade(request, socket, head) });
    this.wss.on('connection', (webSocket: webSocket, req: http.IncomingMessage) => this.onConnection(webSocket, req));
  }

  public getApp(): express.Application {
    return this.app;
  }
}