import PusherServer from 'pusher'
import PusherClient from 'pusher-js'

export const pusherServer = new PusherServer({
  host: '127.0.0.1',
  port: '6001',
  appId: 'app-id',
  key: 'app-key',
  secret: 'app-secret',
  useTLS: false,
});

export const pusherClient = new PusherClient(
  'app-key',
  {
    wsHost: '127.0.0.1',
    wsPort: 6001,
    forceTLS: false,
    disableStats: true,
    enabledTransports: ['ws', 'wss'],
    cluster: 'eu',
  }
);