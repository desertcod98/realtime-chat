"use client";

import { useNotificationsMutation } from "@/app/hooks/use-notifications";
import { TempFullInvite } from "@/app/types";

import { AiFillDelete } from "@react-icons/all-files/ai/AiFillDelete";
import { AiFillCheckCircle } from "@react-icons/all-files/ai/AiFillCheckCircle";
import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Notification(notification: TempFullInvite) {
  const notificationMutation = useNotificationsMutation();

  async function inviteAction(action: "ACCEPT" | "REJECT") {
    notificationMutation.mutate({ inviteId: notification.id, action });
  }

  return (
    <div className="flex items-center justify-between w-full gap-2">
      <Avatar className="cursor-pointer hover:opacity-80">
        <AvatarImage src={notification.inviterImage ?? undefined} />
        <AvatarFallback>{notification.inviterName[0]}</AvatarFallback>
      </Avatar>
      <span key={notification.id} className="w-full">
        <span className="font-bold">{notification.inviterName}</span> invited
        you to chat <span className="font-bold">{notification.chatName}</span>
      </span>
      <div className="flex items-center gap-5">
        <AiFillDelete
          color="red"
          size={25}
          className="cursor-pointer"
          onClick={() => inviteAction("REJECT")}
        />
        <AiFillCheckCircle
          color="green"
          size={25}
          className="cursor-pointer"
          onClick={() => inviteAction("ACCEPT")}
        />
      </div>
    </div>
  );
}
