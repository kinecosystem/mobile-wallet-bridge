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
    url: 'ws://localhost',
    port: 8080
  }
};

const createBtn = $('#create-room');
const sendKinReqBtn = $('#payment-req');
const qrHolders = $('#qr-modal-body');
const socketOpenedMsg = $('#socket-opened-msg');
const slaveConnectedMsg = $('#slave-connected-msg');
const roomCreatedMsg = $('#room-created-msg');
const qrModal = $('#qr-modal');
const paymentModal = $('#payment-modal');
const paymentSpinner = $('#payment-spinner');
const socket = new WebSocket(`${settings.socket.url}:${settings.socket.port}`);

const sendMessage = (msg: Message) => { socket.send(msg.toString()); }

sendKinReqBtn.click(_ => {
  let msg = new Message("make_payment", { "amount": 50, "request_id": uuid(), "public_address": "GAVIE7DPX3M2OOW3XBL2R5V5NHCVUJMHV6WSJVMNYK6YN4IB2GWRKYRQ" })
  sendMessage(msg);
  paymentSpinner.show();
})

createBtn.click(_ => {
  const room_id = uuid();
  const qrData = {
    'ws': socket.url,
    'room': room_id
  };

  qrGenerator.toCanvas(JSON.stringify(qrData), (err: any, canvas: HTMLCanvasElement) => {
    qrHolders.html(canvas);
    let msg = new Message("join", {
      room_id: room_id
    });
    sendMessage(msg);
  });
});


socket.addEventListener('open', (ev: Event) => {
  console.log(ev)
  if (socket.readyState == socket.OPEN)
    socketOpenedMsg.show();
})

socket.addEventListener('message', (ev: MessageEvent) => {
  const msg = JSON.parse(ev.data);
  console.log(msg);
  switch (msg.action) {
    case "join_result":
      if (msg.data.status == "ok") { roomCreatedMsg.show(); }
      break;
    case "message":
      if (msg.data.text == "slave connected") {
        slaveConnectedMsg.show();
        sendKinReqBtn.show();
        (qrModal as any).modal('toggle');
        createBtn.remove();
      }
      break;
    case "payment_receipt":
      paymentSpinner.hide();
      (paymentModal as any).modal();
    default:
      break;
  }
});

