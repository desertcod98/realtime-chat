import qs from "query-string";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";

export const useChatQuery = (chatId: string) => {
  const fetchMessages = async ({ pageParam = undefined }) => {
    const url = qs.stringifyUrl(
      {
        url: "/api/messages/" + chatId,
        query: {
          cursor: pageParam,
        },
      },
      { skipNull: true }
    );
    const res = await fetch(url);
    return res.json();
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } =
    useInfiniteQuery({
      queryKey: [`chat:${chatId}`],
      queryFn: fetchMessages,
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      // refetchInterval: isConnected ? false : 1000,
    });

  return {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  };
};

export const useChatMutation = () => {
  return useMutation({
    mutationFn: ({
      chatId,
      content,
      uploadedFiles,
    }: {
      chatId: string;
      content?: string | undefined;
      uploadedFiles: {
        name: string;
        key: string;
      }[];
    }) => {
      const url = "/api/messages/" + chatId;
      return axios.post(url, { content, uploadedFiles });
    },
  });
};
