import asyncHandler from 'express-async-handler';
import { addClient, removeClient, sendToAllClients } from '../utils/clientManager.js';

export const sseController = {
  connect: asyncHandler((
    /** @type import('express').Request */ req,
    /** @type import('express').Response */ res,
  ) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const clientId = Date.now();
    const newClient = { id: clientId, res };
    addClient(newClient);

    // Function to send updates in JSON format
    setInterval(() => {
      const message = { timestamp: new Date(), message: 'Hourly update' };
      const formattedMessage = `data: ${JSON.stringify(message)}\n\n`;
      console.log(formattedMessage);
      sendToAllClients(formattedMessage); // Ensure this function sends the formattedMessage to each client
    }, 1000);

    req.on('close', () => {
      removeClient(clientId);
    });
  }),
};
