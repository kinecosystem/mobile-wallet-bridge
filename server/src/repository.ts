import { Room } from './room'

export default class Repository {
  private rooms: Array<Room>;

  constructor() {
    this.rooms = new Array<Room>();
  }

  public getRooms(): Array<Room> {
    return this.rooms;
  }
}