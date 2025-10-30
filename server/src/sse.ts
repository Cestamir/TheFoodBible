import type { Response } from 'express';

// broadcast updates to db 

let clients: Response[] = [];

export function registerClient(res: Response) {
  clients.push(res);

  res.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
}

export function broadcastUpdate(data: any) {
  clients.forEach(client => {
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}