import qs from "query-string";
import { useInfiniteQuery } from "@tanstack/react-query";
import { FullMessage } from "../types";

export const useChatQuery = (chatId: string, initialMessages: FullMessage[]) => {

  const fetchMessages = async ({ pageParam = undefined }) => {
    const url = qs.stringifyUrl({
      url: "/api/messages/"+chatId,
      query: {
        cursor: pageParam,
      }
    }, { skipNull: true });
    const res = await fetch(url);
    return res.json();
  };

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: [`chat:${chatId}`],
    queryFn: fetchMessages,
    getNextPageParam: (lastPage) => lastPage?.nextCursor
    // refetchInterval: isConnected ? false : 1000,
  });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  };
}