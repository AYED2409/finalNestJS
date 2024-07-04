const username = localStorage.getItem('name');
if (!username) {
  window.location.replace('/');
  throw new Error('Username required');
}
//status-online status-offline
const statusOnline = document.getElementById('status-online');
const statusOffline = document.getElementById('status-offline');
const usersList = document.querySelector('ul');
const form = document.querySelector('form');
const input = document.querySelector('input');
const chatElement = document.querySelector('#chat');

const renderUsers = (users) => {
  usersList.innerHTML = '';
  users.forEach( (user) => {
    const liElement = document.createElement('li');
    liElement.innerText = user.name;
    usersList.appendChild(liElement);
  });
};

const renderMessage = (payload) => {
  const { userId, message, name } = payload;
  const divElement = document.createElement('div');
  divElement.classList.add('message');
  if (userId !== socket.id ) {
    divElement.classList.add('incoming');
  }
  divElement.innerHTML = `
    <small>${name}</small>
    <p>${message}</p>
  
  `;
  chatElement.appendChild(divElement);
  //scroll al final de los mensajes
  chatElement.scrollTop = chatElement.scrollHeight;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = input.value;
  input.value = '';
  socket.emit('send-message', message);
});

const socket = io({
  auth: {
    token: 'abc',
    name: username,
  },
});

//mensaje cuando se conecta al websocket Server
socket.on('connect', () => {
  console.log('Conectado');
  statusOnline.classList.remove('hidden');
  statusOffline.classList.add('hidden');
});

//mensaje cuando se desconecta del websocket Server
socket.on('disconnect', () => {
  console.log('Desconectado');
  statusOnline.classList.add('hidden');
  statusOffline.classList.remove('hidden');
});

//mensaje "welcome-message" recibido del server
socket.on('welcome-messsage', (data) => {
  console.log({ data });
})

//mensaje "on-clients-changed" recibido del server
socket.on('on-clients-changed', (data) => {
  //console.log(data);
  renderUsers(data);
});

socket.on('on-message', (data) => {
  //console.log({ data });
  renderMessage(data);
});
