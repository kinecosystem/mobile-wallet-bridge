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
}