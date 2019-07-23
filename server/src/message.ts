import AugWebSocket from '../types/ws'
import WebSocket from 'ws'
import { Room } from './room'
import { repository, server } from './dependencies'

export class Message {
  action: string
  data: Object

  static Strings = class {
    static BAD_TYPE = 'bad type';

    static Fields = class {
      static readonly ACTION = "action";
      static readonly DATA = "data";
    }

    static Actions = class {
      static readonly MSG = "message"
      static readonly PING = "ping"
      static readonly PONG = "pong"
      static readonly JOIN = "join"
      static readonly MAKE_PAYMENT = "make_payment"
      static readonly JOIN_RESULT = "join_result"
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
    const data = obj[Message.Strings.Fields.DATA];
    switch (obj[Message.Strings.Fields.ACTION]) {
      case Message.Strings.Actions.JOIN:
        return new JoinAction(data);
        break;
      case Message.Strings.Actions.MAKE_PAYMENT:
        return new MakePaymentMessage(data);
        break;
      case Message.Strings.Actions.PING:
        return new PingAction(data);
        break;
      default:
        throw (Message.Strings.BAD_TYPE)
    }
  }
  public doAction(socket: WebSocket, ...args: any): void { }
}

export class PingAction extends Message {
  constructor(_data?: Object) {
    super(Message.Strings.Actions.PING, _data)
  }

  public doAction(socket: WebSocket, ...args: any): void {
    let msg = new Message(Message.Strings.Actions.PONG, { status: 'ok' })
    server.sendToSocket(socket, msg);
  }
}

export class JoinAction extends Message {

  constructor(_data?: Object) {
    super(Message.Strings.Actions.JOIN, _data)
  }

  public doAction(socket: AugWebSocket, ...args: any): void {
    if ((socket as any).room !== undefined) {
      let msg = new Message(Message.Strings.Actions.MSG, { error: `already in room: ${(socket as any).room.id}` })
      server.sendToSocket(socket, msg);
      return null;
    }

    // create the room if not existing
    const rooms = repository.getRooms();
    let room_id = this.data['room_id'];
    // check if a room with ID exists
    if (rooms.some(room => room.id === room_id)) {
      // if room exits, the second to connect to it is the salve - i.e wallet provider
      let room = rooms.filter(room => room.id === room_id)[0];
      if (room.slave !== undefined)
        room.slave = socket;
      else
        console.log(`${room_id} already has a slave client:'${room.slave.id}'`);
    } else {
      // create room, add the client and push to array
      let newRoom = new Room(room_id, socket);
      socket.room = newRoom;
      repository.pushRoom(newRoom);
    }
    console.log(`${(socket as any).id} joined room id:'${room_id}'`);

    let msg = new Message(Message.Strings.Actions.JOIN_RESULT, { room_id, status: 'ok' })
    server.sendToSocket(socket, msg);
  }
}

export class MakePaymentMessage extends Message {
  constructor(_data?: Object) {
    super(Message.Strings.Actions.MAKE_PAYMENT, _data)
  }

  // Forwords the message to Slave - wallet provider
  public doAction(socket: AugWebSocket, ...args: any): void {
    console.log(`${(socket as any).id} requested payment:'${JSON.stringify(this.data)}'`);
    let clientRoom = socket.room // FIXME: could be null and without a room.
    let walletProvider = clientRoom.slave; // FIXME: could be null
    server.sendToSocket(walletProvider, this);
    server.sendToSocket(socket, new Message(Message.Strings.Actions.MAKE_PAYMENT, { "status": "ok" }));
  }
}