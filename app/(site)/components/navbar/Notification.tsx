"use client";

import { useNotificationsMutation } from "@/app/hooks/use-notifications";
import { TempFullInvite } from "@/app/types";

import { AiFillDelete } from "@react-icons/all-files/ai/AiFillDelete";
import { AiFillCheckCircle } from "@react-icons/all-files/ai/AiFillCheckCircle";


export default function Notification(notification: TempFullInvite) {
  const notificationMutation = useNotificationsMutation();

  async function inviteAction(action: "ACCEPT" | "REJECT") {
    notificationMutation.mutate({ inviteId: notification.id, action });
  }

  return (
    <div className="flex items-center justify-between">
      <span key={notification.id}>{notification.inviterName}</span>
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
