declare var io: SocketIOClientStatic
const QRCode = require('qrcode');
const UUID = require('uuid/v4');
const queryString = require('query-string');

const SOCKET_URL = 'http://b2bedc9e.ngrok.io';
const SOCKET_PORT = 80;

(function () {
  const socket = io(SOCKET_URL + ':' + SOCKET_PORT);
  const createBtn = document.getElementById('create');
  const joinRoomBtn = document.getElementById('join-room-id');
  const joinRoomTxtField = <HTMLInputElement>document.getElementById('room-id');
  const sendKinBtn = document.getElementById('send-ping');

  let parsedUrl = queryString.parse(location.hash);
  joinRoomTxtField.value = parsedUrl['ruid'] || null;

  joinRoomBtn.addEventListener('click', (e) => {
    e.preventDefault();
    socket.emit("join", joinRoomTxtField.value);
  })

  createBtn.addEventListener('click', (e) => {
    e.preventDefault();
    let room_uuid = UUID();
    joinRoomTxtField.value = room_uuid;
    let qr_data = {
      'url': `ws://${window.location.hostname}:${SOCKET_PORT}/socket.io/?EIO=3&transport=websocket`,
      'room': room_uuid
    };
    QRCode.toCanvas(JSON.stringify(qr_data), { errorCorrectionLevel: 'M', version: 5 }, function (err: any, canvas: HTMLCanvasElement) {
      if (err) throw err
      var container = document.getElementById('qr-code')
      container.innerHTML = '';
      container.appendChild(canvas);
      socket.emit("join", room_uuid);
    })
  });

  sendKinBtn.addEventListener('click', (e) => {
    e.preventDefault();
    socket.emit("msg", "Wow!");
  });

  socket.on('alert', (msg: string) => {
    console.log(msg);
  });
})();