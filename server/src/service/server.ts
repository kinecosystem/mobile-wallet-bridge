import * as webSocket from 'ws'
import * as express from 'express';
import * as http from 'http';
import * as net from 'net';
import { UAParser } from 'ua-parser-js';

export class Consts {
  static readonly ACTION = "action";
  static readonly DATA = "data";
  static readonly JOIN = "join";
  static readonly MAKE_PAYMENT = "make_payment";
}

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

  private switch(webSocket: any, msg: any) {
    let act: { (webSocket: any, data: Object): void; };
    switch (msg[Consts.ACTION]) {
      case Consts.JOIN:
        act = this.joinRoom;
        break;
      case Consts.MAKE_PAYMENT:
        act = this.makePayment;
        break;
      default:
        throw ('bad data');
        break;

        act(webSocket, msg[Consts.DATA])
    }
  }

  private makePayment(webSocket: any, data: Object): void {
    console.log(`${webSocket.id} requested payment:'${JSON.stringify(data)}'`);
    let mobileClient = this.rooms[webSocket.room].filter((client: WebSocket) => { return client !== webSocket })[0]
    console.log(mobileClient);
  }

  private joinRoom(webSocket: any, data: Object): void {
    console.log(`${webSocket.id} joined room id:'${data['room_id']}'`);
    let room_id = data['room_id'];
    let serverRoom = this.rooms[room_id];
    if (serverRoom !== undefined) {
      this.rooms[room_id].push(webSocket);
    } else {
      this.rooms[room_id] = [webSocket];
    }
    webSocket.room = room_id;
    webSocket.sendJSON({ "result": "ok" });
  }

  private onMessage(webSocket: any, data: string): void {
    console.log('[server] incoming message: %s', data);
    try {
      let msg = JSON.parse(data);
      if (msg[Consts.ACTION] === undefined) throw ('missing action');
      this.switch(webSocket, msg);
    } catch (e) {
      console.log(e);
      webSocket.sendJSON({ error: `Unexpected message "${data}", Expecting a valid JSON` });
    }
  }

  private onClose(webSocket: webSocket, code: number, reason: string): void {
    console.log('Disconnected client');
    // TODO: how to close?
  }

  private onConnection(webSocket: webSocket | any, req: http.IncomingMessage): void {
    console.log('Connected client - %s - on port %s.', req.connection.remoteAddress, this.options.port);

    webSocket.id = req.headers['sec-websocket-key'];
    webSocket.info = new UAParser(req.headers['user-agent']);
    webSocket.sendJSON = (msg: Object) => { webSocket.send(JSON.stringify(msg)) }

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