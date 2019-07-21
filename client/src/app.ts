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
const sendKinBtn = $('#send-ping');
const qrContainer = $('#qr-code');
const joinRoomTxtField = <JQuery<HTMLInputElement>>$('#room-id');
const parsedUrl = queryString.parse(location.hash);
const socket = new WebSocket(`${settings.socket.url}:${settings.socket.port}`);

joinRoomTxtField.val(parsedUrl['ruid'] || null);
joinRoomBtn.click(e => {
  e.preventDefault();
  // TODO: export to function
  socket.send(JSON.stringify({
    "join": joinRoomTxtField
  }));
});

createBtn.click(e => {
  e.preventDefault();
  // TODO: Export function
  const roomUUID = uuid();
  const qrData = {
    'ws': socket.url,
    'room': roomUUID
  };

  qrGenerator.toCanvas(JSON.stringify(qrData), (err: any, canvas: HTMLCanvasElement) => {
    qrContainer.html(canvas);
    // TODO: Export function
    socket.send(JSON.stringify({
      "join": roomUUID
    }));
  });

  joinRoomTxtField.val(roomUUID);
});


sendKinBtn.click(e => {
  e.preventDefault();
  // TODO: Export function
  socket.send(JSON.stringify({
    "message": "Wow!"
  }));
});

socket.onmessage = (ev: MessageEvent) => console.log(ev.data);