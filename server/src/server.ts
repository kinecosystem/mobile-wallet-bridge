import * as WebSocket from 'ws'

export class WebSocketServer {
  public static readonly PORT: number = 3000;
  private server: WebSocket.Server;
  private options: WebSocket.ServerOptions;

  constructor() {
    this.config();
    this.createServer();
    this.listen();
  }

  private createServer(): void {
    this.server = new WebSocket.Server(this.options);
  }

  private config(): void {
    this.options = {
      port: Number(process.env.PORT) || WebSocketServer.PORT
    };
  }

  private listen(): void {
    console.log('Running WebSocket server on port %s', this.options.port);
    this.server.on('connection', (webSocket) => {
      console.log('Connected client on port %s.', this.options.port);
      webSocket.on('message', (message) => {
        console.log('[server](message): %s', JSON.stringify(message));

        // broadcasting to every other connected WebSocket clients, excluding itself.
        this.server.clients.forEach((client) => {
          if (client !== webSocket && client.readyState === WebSocket.OPEN) {
            client.send(`Broadcasting incoming message: ${message}`);
          }
        });
      });
    });
  }

  public getServer(): WebSocket.Server {
    return this.server;
  }
}