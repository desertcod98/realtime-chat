"use client";

import { useState } from "react";
import NavbarChat from "./NavbarChat";
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area";

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
  };
}

export default function NavbarChats({
  membersData,
}: {
  membersData: MemberData[];
}) {
  const [activeChatId, setActiveChatId] = useState<string>();
  const [searchQuery, setSearchQuery] = useState<string>();

  return (
    <div className="flex flex-col gap-3 p-3 overflow-y-auto">
      <Input type="text" placeholder="Search chat..." onChange={e => setSearchQuery(e.target.value)}/>
      <ScrollArea>
        {membersData.map((member) => {
          if (!member.chat.isGroup) {
            if(searchQuery && !member.chat.members[0].user.name.toLowerCase().includes(searchQuery.toLowerCase())){
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
              />
            );
          } else {
            if(searchQuery && !member.chat.name!.toLowerCase().includes(searchQuery.toLowerCase())){
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
              />
            );
          }
        })}
      </ScrollArea>
    </div>
  );
}
