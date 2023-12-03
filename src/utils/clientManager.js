// clientManager.js
let clients = [];

export const addClient = (client) => {
  clients.push(client);
};

export const removeClient = (id) => {
  clients = clients.filter((client) => client.id !== id);
};

export const sendToAllClients = (data) => {
  clients.forEach((client) => client.res.write(data));
};

 // 1 hour

// module.exports = { addClient, removeClient, sendToAllClients };
