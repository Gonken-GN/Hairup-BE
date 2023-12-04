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
    // Function to send updates
    setInterval(() => {
      const message = { timestamp: new Date(), message: 'Hourly update' };
  const formattedMessage = `data: ${JSON.stringify(message)}\n\n`;
  sendToAllClients(formattedMessage);
    }, 3600000);
    req.on('close', () => {
      removeClient(clientId);
    });
  }),
};
