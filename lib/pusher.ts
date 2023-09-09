import PusherServer from 'pusher'
import PusherClient from 'pusher-js'

export const pusherServer = new PusherServer({
  // host: process.env.NEXT_PUBLIC_SOKET_URL!,
  // port: '6001',
  appId: process.env.NEXT_PUBLIC_app_id!,
  key: process.env.NEXT_PUBLIC_key!,
  secret: process.env.secret!,
  cluster: 'eu',
  useTLS: true,
});

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_key!,
  {
    // wsHost: process.env.NEXT_PUBLIC_SOKET_URL!,
    // wsPort: 6001,
    // forceTLS: false,
    // enabledTransports: ['ws', 'wss'],
    cluster: 'eu',
  }
);