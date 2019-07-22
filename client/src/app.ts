import * as qrGenerator from 'qrcode';
import * as queryString from 'query-string';
import * as uuid from 'uuid/v4';

export class Message {
  action: string
  data: Object

  constructor(_action: string, _data: Object) {
    this.action = _action
    this.data = Object.assign({}, _data)
  }

  public toJson() {

  }

  public toString(): string {
    return JSON.stringify(this)
  }
}


const settings = {
  socket: {
    url: 'ws://localhost',
    port: 8080
  }
};

const createBtn = $('#create');
const joinRoomBtn = $('#join-room-id');
const sendPing = $('#send-ping');
const qrContainer = $('#qr-code');
const sendKinReqBtn = $('#send-pay-req');
const joinRoomTxtField = <JQuery<HTMLInputElement>>$('#room-id');
const socket = new WebSocket(`${settings.socket.url}:${settings.socket.port}`);
const sendMessage = (msg: Message) => { socket.send(msg.toString()); }

// disable links
$('a').click(e => { e.preventDefault() });

joinRoomBtn.click(_ => {
  let msg = new Message("join", {
    room_id: joinRoomTxtField.val()
  })
  sendMessage(msg);
});

createBtn.click(_ => {
  const room_id = uuid();
  const qrData = {
    'ws': socket.url,
    'room': room_id
  };

  qrGenerator.toCanvas(JSON.stringify(qrData), (err: any, canvas: HTMLCanvasElement) => {
    qrContainer.html(canvas);
    let msg = new Message("join", {
      room_id: room_id
    });
    sendMessage(msg);
  });

  joinRoomTxtField.val(room_id);
});


sendPing.click(_ => {
  let msg = new Message("ping", {
    "text": "ping!"
  })
  sendMessage(msg);
});

socket.onmessage = (ev: MessageEvent) => console.log(ev.data);

