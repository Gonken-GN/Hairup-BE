// clientManager.js
let clients = [];

const addClient = (client) => {
  clients.push(client);
};

const removeClient = (id) => {
  clients = clients.filter((client) => client.id !== id);
};

const sendToAllClients = (data) => {
  clients.forEach((client) => client.res.write(data));
};

// Function to send updates
setInterval(() => {
  const message = { timestamp: new Date(), message: 'Hourly update' };
  sendToAllClients(message);
}, 3600000); // 1 hour

module.exports = { addClient, removeClient, sendToAllClients };
