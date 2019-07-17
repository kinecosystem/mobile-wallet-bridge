declare var io: SocketIOClientStatic
// declare function uuidv4(): any
// declare class QRCode

(function () {
  const socket = io('http://127.0.0.1:81');

  const join = document.getElementById('join');
  join.addEventListener('click', (e) => {
    e.preventDefault();
    // let room_uuid = uuidv4();
    socket.emit("join", 'TEST');
  });

  const send_kin = document.getElementById('send-ping');
  send_kin.addEventListener('click', (e) => {
    e.preventDefault();
    socket.emit("msg", "Wow!");
  });

  socket.on('alert', (msg: string) => {
    console.log(msg);
  });
})();