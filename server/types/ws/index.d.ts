import WebSocket from 'ws'
import { Room } from '../../src/room'

declare class AugWebSocket extends WebSocket {
  id?: string
  room?: Room
}

export = AugWebSocket