"use client";

import { useNotifications } from "@/app/hooks/use-notifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { IoMdNotificationsOutline } from "@react-icons/all-files/io/IoMdNotificationsOutline";
import Notification from "./Notification";
import { useEffect } from "react";
import { pusherClient } from "@/lib/pusher";
import { TempFullInvite } from "@/app/types";
import { useQueryClient } from "@tanstack/react-query";
import { Separator } from "@/components/ui/separator";

export default function Notifications({ userId }: { userId: string }) {
  const notifications = useNotifications();
  const queryClient = useQueryClient();

  const channelName = `notifications=${userId}`;

  useEffect(() => {
    pusherClient.subscribe(channelName);
    pusherClient.bind("notification=new", onNewMessage);
  }, []);

  function onNewMessage(notification: TempFullInvite) {
    queryClient.setQueryData(["notifications"], (oldData: any) => {
      if (!oldData || oldData.length === 0) {
        return [notification];
      } else {
        return [...oldData, notification];
      }
    });
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          {notifications.data && notifications.data.length > 0 && (
            <div className="absolute top-0 right-0 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
              <span>{notifications.data.length}</span>
            </div>
          )}
          <IoMdNotificationsOutline size={35} className="cursor-pointer" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] shadow-xl border-2 border-slate-400">
        {notifications.data && notifications.data.length > 0 ? (
          notifications.data.map((notification) => {
            return (
              <>
                <Notification {...notification} key={notification.id} />
                <Separator className="my-2" />
              </>
            );
          })
        ) : (
          <span>No notifications.</span>
        )}
      </PopoverContent>
    </Popover>
  );
}
