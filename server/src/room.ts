import AugWebSocket from '../types/ws'
export class Room {
  public id: string
  public master: AugWebSocket // the broweser, using the slave for wallet ops
  public slave?: AugWebSocket // the wallet provider, acting on behalf of the client

  constructor(_id: string, _master: AugWebSocket) {
    this.id = _id;
    this.master = _master;
  }
}