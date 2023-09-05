"use client";

import * as z from "zod";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { useQueryClient } from "@tanstack/react-query";
import MessageAttachment from "./AddMessageAttachments";
import { useState } from "react";

const formSchema = z.object({
  content: z.string().min(1).optional(),
});

export default function ChatInput({ chatId }: { chatId: string }) {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (!values.content && files.length === 0) return;

      let uploadedFiles: { name: string; key: string }[] = [];
      if (files.length > 0) {
        uploadedFiles = await uploadFiles(files);
      }

      const url = "/api/messages/" + chatId;
      const res = await axios.post(url, { ...values, uploadedFiles });
      form.reset();
      queryClient.refetchQueries(["chat:" + chatId]); //use optimistic update instead
    } catch (error) {
      console.log(error);
    }
  };

  async function uploadFiles(files: File[]) {
    const res = await axios.put(
      "/api/message-attachment",
      files.map((file) => file.name)
    );
    const data: { name: string; putUrl: string; key: string }[] = res.data;
    const uploads = data.map((file) => {
      return axios.put(file.putUrl, files.filter(f => f.name === file.name)[0]);
    });
    await Promise.all(uploads);
    return data;
  }

  return (
    <Form {...form}>
      {files.map((file) => {
        return <span key={file.size}>{file.name}</span>;
      })}
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="w-full flex items-center">
                  <div className="absolute left-2">
                    <MessageAttachment
                      addFiles={
                        (newFiles: File[]) => setFiles([...files, ...newFiles]) //TODO check if file is already in list
                      }
                    />
                  </div>
                  <Input
                    type="text"
                    className="w-full pl-10"
                    placeholder="Send a message"
                    {...field}
                  />
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
