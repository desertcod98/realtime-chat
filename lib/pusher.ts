import PusherServer from 'pusher'
import PusherClient from 'pusher-js'

export const pusherServer = new PusherServer({
  host: process.env.NEXT_PUBLIC_SOKETI_URL!,
  appId: process.env.NEXT_PUBLIC_SOKETI_APP_ID!,
  key: process.env.NEXT_PUBLIC_SOKETI_APP_KEY!,
  secret: process.env.SOKETI_APP_SECRET!,
  cluster: 'eu',
  useTLS: true,
});

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_SOKETI_APP_KEY!,
  {
    wsHost: process.env.NEXT_PUBLIC_SOKETI_URL!,
    enabledTransports: ['ws', 'wss'],
    cluster: 'eu',
  }
);

