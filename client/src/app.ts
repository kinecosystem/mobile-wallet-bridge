import * as qrGenerator from 'qrcode';
import * as queryString from 'query-string';
import * as uuid from 'uuid/v4';


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
const parsedUrl = queryString.parse(location.hash);
const socket = new WebSocket(`${settings.socket.url}:${settings.socket.port}`);
const sendMessage = (msg: Object) => { socket.send(JSON.stringify(msg)); }

// disable links
$('a').click(e => { e.preventDefault() });

joinRoomBtn.click(_ => {
  sendMessage({
    "action": "join",
    "data": {
      room_id: joinRoomTxtField.val()
    }
  });
});

createBtn.click(_ => {
  const room_id = uuid();
  const qrData = {
    'ws': socket.url,
    'room': room_id
  };

  qrGenerator.toCanvas(JSON.stringify(qrData), (err: any, canvas: HTMLCanvasElement) => {
    qrContainer.html(canvas);
    sendMessage({
      "action": "join",
      "data": {
        room_id
      }
    });
  });

  joinRoomTxtField.val(room_id);
});


sendPing.click(_ => {
  sendMessage({
    "action": "message",
    "data": "ping"
  })
});

socket.onmessage = (ev: MessageEvent) => console.log(ev.data);

