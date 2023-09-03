"use client";

import { FullMessage } from "@/app/types";
import Message from "./Message";
import { ElementRef, Fragment, useEffect, useRef, useState } from "react";
import { useChatQuery } from "@/app/hooks/use-chat-query";
import { useChatScroll } from "@/app/hooks/use-chat-scroll";
import { useInView } from "react-intersection-observer";

export default function Body({
  initialMessages,
  chatId,
}: {
  initialMessages: FullMessage[];
  chatId: string;
}) {
  const bottomRef = useRef<ElementRef<"div">>(null);
  const chatRef = useRef<ElementRef<"div">>(null);

  const { ref, inView } = useInView();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useChatQuery(chatId, initialMessages);

  // useChatScroll({
  //   chatRef,
  //   bottomRef,
  //   loadMore: fetchNextPage,
  //   shouldLoadMore: !isFetchingNextPage && !!hasNextPage,
  //   count: data?.pages?.[0]?.items?.length ?? 0,
  // })

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView]);

  useEffect(() => {
    if (data?.pages?.length === 1) bottomRef.current?.scrollIntoView();
    // else{
    //   const nNewItems : number = data?.pages[data.pages.length-1].length;
    //   if(chatRef.current){
    //     console.log(chatRef.current.scrollTop);
    //   }
    // }
    // console.log(chatRef.current?.scrollHeight);
  }, [data]);

  return (
    <div className="flex-1 flex flex-col-reverse mt-auto overflow-y-auto h-full" ref={chatRef}>
      <div ref={bottomRef} />
      {data?.pages?.map((group, i) => (
        <Fragment key={i}>
          {group.items.map((message: FullMessage) => (
            <Message key={message.id} content={message.content!} />
          ))}
        </Fragment>
      ))}
      <div ref={ref} />
    </div>
  );
}
