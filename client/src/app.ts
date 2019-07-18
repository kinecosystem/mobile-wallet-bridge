const QRCode = require('qrcode');
const UUID = require('uuid/v4');
const queryString = require('query-string');

const SOCKET_URL = 'ws://localhost';
const SOCKET_PORT = 8080;

(function () {
  const socket = new WebSocket(SOCKET_URL + ':' + SOCKET_PORT);
  const createBtn = document.getElementById('create');
  const joinRoomBtn = document.getElementById('join-room-id');
  const joinRoomTxtField = <HTMLInputElement>document.getElementById('room-id');
  const sendKinBtn = document.getElementById('send-ping');

  let parsedUrl = queryString.parse(location.hash);
  joinRoomTxtField.value = parsedUrl['ruid'] || null;

  joinRoomBtn.addEventListener('click', (e) => {
    e.preventDefault();
    socket.send(JSON.stringify({
      "join": joinRoomTxtField
    }));
  })

  createBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let room_uuid = UUID();
    joinRoomTxtField.value = room_uuid;
    let qr_data = {
      'url': `ws://${window.location.hostname}:${SOCKET_PORT}/socket.io/?EIO=3&transport=websocket`,
      'room': room_uuid
    };
    QRCode.toCanvas(JSON.stringify(qr_data), {
      errorCorrectionLevel: 'M',
      version: 7
    }, function (err: any, canvas: HTMLCanvasElement) {
      if (err) throw err
      const container = document.getElementById('qr-code')
      container.innerHTML = '';
      container.appendChild(canvas);
      socket.send(JSON.stringify({
        "join": room_uuid
      }));
    })
  });

  sendKinBtn.addEventListener('click', (e) => {
    e.preventDefault();
    socket.send(JSON.stringify({
      "message": "Wow!"
    }));
  });

  socket.onmessage = (ev: MessageEvent) => {
    console.log(ev.data);
  };
})();