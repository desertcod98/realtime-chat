"use client";

import * as z from "zod";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import MessageAttachment from "./AddMessageAttachments";
import { useState } from "react";
import { useChatMutation } from "@/app/hooks/use-chat-query";
import UploadAttachment from "./UploadAttachment";

const formSchema = z.object({
  content: z
    .union([z.string().length(0), z.string().min(1)])
    .optional()
    .transform((e) => (e === "" ? undefined : e)),
});

export default function ChatInput({ chatId }: { chatId: string }) {
  const [files, setFiles] = useState<File[]>([]);
  const chatMutation = useChatMutation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      let uploadedFiles: { name: string; key: string }[] = [];
      if (files.length > 0) {
        uploadedFiles = await uploadFiles(files);
      }

      if(uploadedFiles.length === 0 && !values.content ){
        return;
      }

      chatMutation.mutate({ chatId, ...values, uploadedFiles });
      form.reset();
      setFiles([]);
    } catch (error) {}
  };

  async function uploadFiles(files: File[]) {
    const res = await axios.put(
      "/api/message-attachment",
      files.map((file) => file.name)
    );
    const data: { name: string; putUrl: string; key: string }[] = res.data;
    const uploads = data.map((file) => {
      return axios.put(
        file.putUrl,
        files.filter((f) => f.name === file.name)[0]
      );
    });
    await Promise.all(uploads);
    return data;
  }

  return (
    <div className="flex flex-col w-full gap-2">
      {files && files.length > 0 && (
        <div className="w-full h-60 bg-slate-200 flex items-center p-3 rounded-xl gap-3">
          {files.map((file) => {
            return (
              <UploadAttachment
                url={URL.createObjectURL(file)}
                name={file.name}
                key={file.name}
                removeAttachment={() =>
                  setFiles(files.filter((f) => f.name !== file.name))
                }
              />
            );
          })}
        </div>
      )}

      <Form {...form}>
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
                          (newFiles: File[]) =>
                            setFiles([...files, ...newFiles]) //TODO check if file is already in list
                        }
                      />
                    </div>
                    <Input
                      disabled={isLoading}
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
    </div>
  );
}
