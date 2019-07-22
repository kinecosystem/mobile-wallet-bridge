import * as WebSocket from 'ws'
import { Room } from './room'

export default class Repository {
  private rooms: Array<Room>;

  constructor() {
    this.rooms = new Array<Room>();
  }

  public getRooms(): Array<Room> {
    return this.rooms;
  }

  public pushRoom(room: Room) {
    this.rooms.push(room);
  }

  public pushToRoom(socket: WebSocket, room_id: string) {
    let room = this.rooms.filter(room => room.id == room_id)[0];
    room.push(socket);
  }
}