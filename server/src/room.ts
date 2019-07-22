import * as webSocket from 'ws'

export class Room {
  id: string
  clients: Array<webSocket>

  // no more than MAX_ROOM_SIZE are allowed in a room
  // TODO: Validate a mobile and a browser are connected
  // TODO: How secure is that?
  public readonly MAX_ROOM_SIZE = 2;

  constructor(_id: string) {
    this.id = _id;
    this.clients = new Array<webSocket>();
  }

  public push(client: webSocket): void {
    if (this.clients.length < this.MAX_ROOM_SIZE)
      this.clients.push(client)
    else
      throw (`room ${this.id} is full. can't add more clients`);
  }

}