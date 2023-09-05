"use client";

import * as z from "zod";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { FullMessage } from "@/app/types";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  content: z.string().min(1),
  imageUrl
});

export default function ChatInput({ chatId }: { chatId: string }) {
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const url = "/api/messages/" + chatId;
      const res = await axios.post(url, values);
      form.reset();
      queryClient.refetchQueries(["chat:" + chatId]); //use optimistic update instead
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-[97%]">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="text"
                  className="w-full"
                  placeholder="Send a message"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name=""
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  type="file"
                  id="images"
                  {...field}
                  accept="image/*"
                  multiple
                  required
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
