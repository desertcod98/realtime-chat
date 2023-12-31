"use client";

import { FullMessage } from "@/app/types";
import Message from "./Message";
import { ElementRef, Fragment, useEffect, useRef } from "react";
import { useChatQuery } from "@/app/hooks/use-chat-query";
import { useInView } from "react-intersection-observer";
import ChatInput from "./ChatInput";
import { pusherClient } from "@/lib/pusher";
import { useQueryClient } from "@tanstack/react-query";

export default function Body({
  chatId,
  isGroup,
  userId,
}: {
  userId: string;
  chatId: string;
  isGroup: boolean;
}) {
  const bottomRef = useRef<ElementRef<"div">>(null);
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery(chatId);

  function onNewMessage(message: FullMessage) {
    queryClient.setQueryData(["chat:" + chatId], (oldData: any) => {
      if (!oldData || !oldData.pages || oldData.pages.length === 0) {
        return {
          pages: [
            {
              items: [message],
            },
          ],
        };
      }
      const newData = [...oldData.pages];

      newData[0] = {
        ...newData[0],
        items: [message, ...newData[0].items],
      };
      return {
        ...oldData,
        pages: newData,
      };
    });
  }

  function onMessageDeleted({ messageId }: { messageId: number }) {
    queryClient.setQueryData(["chat:" + chatId], (oldData: any) => {
      if (!oldData || !oldData.pages || oldData.pages.length === 0) {
        return { pages: [{ items: [] }] };
      }
      const newData: { pages: { items: [] }[] } = { pages: [] };
      for (const page of oldData.pages) {
        newData.pages.push({
          items: page.items.filter((i: any) => i.id !== messageId),
        });
      }
      return newData;
    });
  }

  function onMessageEdited({
    messageId,
    content,
    updatedAt,
  }: {
    messageId: number;
    content: string | undefined;
    updatedAt: Date;
  }) {
    queryClient.setQueryData(["chat:" + chatId], (oldData: any) => {
      if (!oldData || !oldData.pages || oldData.pages.length === 0) {
        return { pages: [{ items: [] }] };
      }
      const newData: { pages: { items: [] }[] } = { pages: [] };
      for (const page of oldData.pages) {
        newData.pages.push({
          items: page.items.map((i: any) => {
            if (i.id === messageId) {
              return { ...i, content: content, updatedAt: updatedAt };
            }
            return i;
          }),
        });
      }
      return newData;
    });
  }

  const channelName = `chat=${chatId}`;

  useEffect(() => {
    pusherClient.subscribe(channelName);
    pusherClient.bind("message=new", onNewMessage);
    pusherClient.bind("message=deleted", onMessageDeleted);
    pusherClient.bind("message=edited", onMessageEdited);
  }, []);

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  useEffect(() => {
    if (data?.pages?.length === 1) bottomRef.current?.scrollIntoView();
  }, [data]);

  return (
    <div className="flex flex-col relative w-full h-full pt-[90px]">
      <div className="flex-1 flex flex-col-reverse mt-auto overflow-y-auto h-full gap-5 w-full">
        <div ref={bottomRef} />
        {data?.pages?.map((group, i) => (
          <Fragment key={i}>
            {group.items.map((message: FullMessage) => (
              <Message
                key={message.id}
                message={message}
                isGroup={isGroup}
                userId={userId}
              />
            ))}
          </Fragment>
        ))}
        <div ref={ref} className="w-full mt-5"></div>
      </div>
      <div className="w-[97%] flex justify-center mb-3">
        <ChatInput chatId={chatId} />
      </div>
    </div>
  );
}
