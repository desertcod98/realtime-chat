import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TempFullInvite } from "../types";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export const useNotifications = () =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await fetch("/api/invites");
      const json: TempFullInvite[] = await res.json();
      return json;
    },
  });

export const useNotificationsMutation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: ({
      inviteId,
      action,
    }: {
      inviteId: number;
      action: "ACCEPT" | "REJECT";
    }) => {
      const url = "/api/invite/action/";
      return axios.patch(url, { inviteId, action });
    },
    onError: (err: any) => {
      console.log(err);
      if (err.response && err.response.data) toast.error(err.response.data);
    },
    onSuccess(err, data, context) {
      toast.success(data.action === "ACCEPT" ? "Invite accepted!" : "Invite rejected!");
      router.refresh();
    },
    onSettled() {
      queryClient.refetchQueries(["notifications"]);
    }
  });
};
