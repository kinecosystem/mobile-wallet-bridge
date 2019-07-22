import * as WebSocket from 'ws'
import { Room } from './room'
import { repository, server } from './dependencies'

export class Message {
  action: string
  data: Object

  static Consts = class {
    static BAD_TYPE = 'bad type';

    static Fields = class {
      static readonly ACTION = "action";
      static readonly DATA = "data";
    }

    static Actions = class {
      static readonly PING = "ping"
      static readonly PONG = "PONG"
      static readonly JOIN = "join";
      static readonly MAKE_PAYMENT = "make_payment";
      static readonly JOIN_RESULT = "join_result";
    }
  }

  constructor(_action?: string, _data?: Object) {
    this.action = _action
    this.data = Object.assign({}, _data)
  }

  public toString(): string {
    return JSON.stringify(this)
  }

  static fromJson(obj: Object) {
    const data = obj[Message.Consts.Fields.DATA];
    switch (obj[Message.Consts.Fields.ACTION]) {
      case Message.Consts.Actions.JOIN:
        return new JoinAction(data);
        break;
      case Message.Consts.Actions.MAKE_PAYMENT:
        return new MakePaymentMessage(data);
        break;
      case Message.Consts.Actions.PING:
        return new PingAction(data);
        break;
      default:
        throw (Message.Consts.BAD_TYPE)
    }
  }
  public doAction(socket: WebSocket, ...args: any): void { }
}

class PingAction extends Message {
  constructor(_data?: Object) {
    super(Message.Consts.Actions.PING, _data)
  }

  public doAction(socket: WebSocket, ...args: any): void {
    let msg = new Message(Message.Consts.Actions.PONG, { status: 'ok' })
    server.sendToSocket(socket, msg);
  }
}

class JoinAction extends Message {

  constructor(_data?: Object) {
    super(Message.Consts.Actions.JOIN, _data)
  }

  public doAction(socket: WebSocket, ...args: any): void {
    // create the room if not existing
    const rooms = repository.getRooms();
    let room_id = this.data['room_id'];
    if (rooms.some(room => room.id === room_id)) {
      // room existing, add client
      let room = rooms.filter(room => room.id === room_id)[0];
      room.push(socket);
    } else {
      // create room, add the client and push to array
      let newRoom = new Room(room_id);
      newRoom.clients.push(socket);
      rooms.push(newRoom);
    }
    console.log(`${(socket as any).id} joined room id:'${this.data['room_id']}'`);
    (socket as any).room = room_id;

    let msg = new Message(Message.Consts.Actions.JOIN_RESULT, { room_id: room_id, status: 'ok' })
    server.sendToSocket(socket, msg);
  }
}

class MakePaymentMessage extends Message {
  constructor(_data?: Object) {
    super(Message.Consts.Actions.MAKE_PAYMENT, _data)
  }

  public doAction(socket: WebSocket, ...args: any): void {
    const rooms = repository.getRooms();

    console.log(`${(socket as any).id} requested payment:'${JSON.stringify(this.data)}'`);
    let clientsRoom = rooms.filter(room => room.id == (socket as any).room)[0];
    let mobileClient = clientsRoom.clients.filter(client => (client as any).id != (socket as any).id)[0]

    server.sendToSocket(mobileClient, this)
  }
}