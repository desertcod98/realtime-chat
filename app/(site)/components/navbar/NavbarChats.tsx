"use client";

import { useEffect, useState } from "react";
import NavbarChat from "./NavbarChat";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { pusherClient } from "@/lib/pusher";
import toast from "react-hot-toast";
import { PartialMessage } from "@/app/types";

interface MemberData {
  id: number;
  userId: string;
  createdAt: Date;
  chatId: string;
  isAdministrator: boolean | null;
  isRemoved: boolean | null;
  chat: {
    id: string;
    name: string | null;
    image: string | null;
    created_at: Date;
    isGroup: boolean;
    description: string | null;
    members: {
      id: number;
      userId: string;
      createdAt: Date;
      chatId: string;
      isAdministrator: boolean | null;
      isRemoved: boolean | null;
      user: {
        name: string;
        image: string | null;
      };
    }[];
    messages: PartialMessage[];
  };
}

export default function NavbarChats({
  membersData,
  userId,
}: {
  membersData: MemberData[];
  userId: string;
}) {
  const [activeChatId, setActiveChatId] = useState<string>();
  const [searchQuery, setSearchQuery] = useState<string>();
  const [chats, setChats] = useState<MemberData[]>();

  function onNewChat(chat: MemberData) {
    setChats((c) => {
      if (c) {
        return [...c, chat];
      } else {
        return [chat];
      }
    });
    toast.success(
      chat.chat.members[0].user.name + " created a private chat with you"
    );
  }

  useEffect(() => {
    pusherClient.subscribe(`chats=${userId}`);
    pusherClient.bind("chats=new", onNewChat);
  }, []);

  useEffect(() => {
    setChats(membersData);
  }, [membersData]);

  return (
    <div className="flex flex-col gap-3 p-3 overflow-y-auto">
      <Input
        type="text"
        placeholder="Search chat..."
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <ScrollArea>
        {chats &&
          chats.map((member) => {
            if (!member.chat.isGroup) {
              if (
                searchQuery &&
                !member.chat.members[0].user.name
                  .toLowerCase()
                  .includes(searchQuery.toLowerCase())
              ) {
                return;
              }
              return (
                <NavbarChat
                  key={member.id}
                  name={member.chat.members[0].user.name}
                  chatId={member.chatId}
                  imgUrl={member.chat.members[0].user.image ?? undefined}
                  setActive={() => setActiveChatId(member.chatId)}
                  active={activeChatId === member.chatId}
                  lastMessage={member.chat.messages[0]}
                />
              );
            } else {
              if (
                searchQuery &&
                !member.chat
                  .name!.toLowerCase()
                  .includes(searchQuery.toLowerCase())
              ) {
                return;
              }
              return (
                <NavbarChat
                  key={member.id}
                  name={member.chat.name!}
                  chatId={member.chatId}
                  imgUrl={member.chat.image ?? undefined}
                  setActive={() => setActiveChatId(member.chatId)}
                  active={activeChatId === member.chatId}
                  lastMessage={member.chat.messages[0]}
                />
              );
            }
          })}
      </ScrollArea>
    </div>
  );
}
