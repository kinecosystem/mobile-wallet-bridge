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

  public toString(): string {
    return JSON.stringify(this)
  }
}


const settings = {
  socket: {
    url: 'ws://0.tcp.ngrok.io',
    port: 12274
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

sendKinReqBtn.click(_ => {
  let msg = new Message("make_payment", {
    "data": { "amount": 50, "request_id": uuid(), "public_address": "GAVIE7DPX3M2OOW3XBL2R5V5NHCVUJMHV6WSJVMNYK6YN4IB2GWRKYRQ" }
  })
  sendMessage(msg);
})

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

