"use client";

import { useNotifications } from "@/app/hooks/use-notifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { IoMdNotificationsOutline } from "react-icons/io";
import Notification from "./Notification";

export default function Notifications() {
  const notifications = useNotifications();

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
      <PopoverContent className="w-80">
        {notifications.data && notifications.data.length > 0 ? (
          notifications.data.map((notification) => {
            return <Notification {...notification} key={notification.id} />;
          })
        ) : (                             
          <span>No notifications.</span>
        )}
      </PopoverContent>
    </Popover>
  );
}
