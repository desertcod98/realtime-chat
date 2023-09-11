import { useQuery } from "@tanstack/react-query";
import { FullInvite } from "../types";

export const useNotifications = () =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/invites");
      const json: FullInvite[] = await res.json();
      return json;
    },
  });
