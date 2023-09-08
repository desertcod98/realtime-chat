"use client";

import { FullMessage } from "@/app/types";
import Message from "./Message";
import { ElementRef, Fragment, useEffect, useRef, useState } from "react";
import { useChatQuery } from "@/app/hooks/use-chat-query";
import { useInView } from "react-intersection-observer";
import ChatInput from "./ChatInput";
import { pusherClient } from "@/lib/pusher";
import { useQueryClient } from "@tanstack/react-query";

export default function Body({
  chatId,
  isGroup,
}: {
  chatId: string;
  isGroup: boolean;
}) {
  const bottomRef = useRef<ElementRef<"div">>(null);
  const queryClient = useQueryClient();
  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery(chatId);


    function onNewMessage(message: FullMessage){
      queryClient.setQueryData(["chat:"+chatId], (oldData : any) => {
        if (!oldData || !oldData.pages || oldData.pages.length === 0) {
          return {
            pages: [{
              items: [message],
            }]
          }
        }
        const newData = [...oldData.pages];

        newData[0] = {
          ...newData[0],
          items: [
            message,
            ...newData[0].items,
          ]
        };
        return {
          ...oldData,
          pages: newData,
        };
      })
    }

    const channelName = `chat=${chatId}`;

    useEffect(() => {
      pusherClient.subscribe(channelName);
      pusherClient.bind('message=new', onNewMessage);
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
    <div className="flex flex-col gap-5 relative w-full h-full">
      <div
        className="flex-1 flex flex-col-reverse mt-auto overflow-y-auto h-full gap-5 mb-14"
      >
        <div ref={bottomRef} />
        {data?.pages?.map((group, i) => (
          <Fragment key={i}>
            {group.items.map((message: FullMessage) => (
              <Message key={message.id} message={message} isGroup={isGroup} />
            ))}
          </Fragment>
        ))}
        <div ref={ref} className="w-full mt-5"></div>
      </div>
      <div className="absolute bottom-5 w-[97%] flex justify-center">
        <ChatInput chatId={chatId}/>
      </div>
    </div>
  );
}
