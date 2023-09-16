"use client";

import { FullMessage } from "@/app/types";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Attachment from "./Attachment";
import { AiFillDelete } from "@react-icons/all-files/ai/AiFillDelete";
import { AiFillEdit } from "@react-icons/all-files/ai/AiFillEdit";
import DeleteAlert from "./DeleteAlert";
import { useState } from "react";
import toast from "react-hot-toast";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/date";

const formSchema = z.object({
  content: z.string().min(1),
});

export default function Message({
  message,
  isGroup,
  userId,
}: {
  message: FullMessage;
  isGroup: boolean;
  userId: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: message.content ?? undefined,
    },
  });

  async function onDelete() {
    fetch("/api/message/" + message.id, {
      method: "DELETE",
    }).then((res) => {
      if (res.status !== 200) {
        res.text().then((error) => toast.error(error));
      } else {
        toast.success("Message deleted");
      }
    });
  }

  const onEdit = async (values: z.infer<typeof formSchema>) => {
    fetch("/api/message/" + message.id, {
      method: "PATCH",
      body: JSON.stringify(values),
    }).then((res) => {
      if (res.status !== 200) {
        res.text().then((error) => toast.error(error));
      }
    });
    setIsEditing(false);
    try {
    } catch (error) {}
  };

  const isLoading = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onEdit)} className="w-full">
        <div className="flex flex-col gap-3 hover:bg-slate-200 rounded-md w-[97%] relative group">
          <div className="flex items-center gap-5 w-full">
            <Avatar className="cursor-pointer hover:opacity-80">
              <AvatarImage src={message.member.user.image ?? undefined} />
              <AvatarFallback>{message.member.user.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col w-[95%]">
              <div className="flex gap-3 items-center">
                <h3 className="font-semibold">{message.member.user.name}</h3>
                <span className="text-sm">
                  {formatDate(new Date(message.createdAt))}
                </span>
                {message.createdAt !== message.updatedAt && (
                  <span className="text-sm">
                    (edited {formatDate(new Date(message.updatedAt))})
                  </span>
                )}
              </div>
              {!isEditing ? (
                <span className="w-full break-words">{message.content}</span>
              ) : (
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          autoFocus
                          disabled={isLoading}
                          type="text"
                          className="w-full h-7 focus-visible:ring-0"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>
          {message.messageFiles && message.messageFiles.length > 0 && (
            <div className="flex w-fit max-w-[90%] items-center ml-14 max-h-60 gap-5 group-hover:bg-slate-300 px-2 bg-slate-50 mr-14 rounded-xl overflow-x-auto">
              {message.messageFiles.map((file) => {
                return <Attachment key={file.url} {...file} />;
              })}
            </div>
          )}
          {message.member.userId === userId && (
            <div className="hidden absolute top-[-13px] right-5 group-hover:flex gap-2 bg-slate-100 border-2 border-zinc-500 rounded-lg p-1">
              <AiFillEdit
                size={25}
                className="cursor-pointer"
                onClick={() => setIsEditing(true)}
              />
              <AiFillDelete
                size={25}
                className="cursor-pointer"
                onClick={() => setIsDeleting(true)}
              />
              <DeleteAlert
                close={() => setIsDeleting(false)}
                open={isDeleting}
                delete={onDelete}
              />
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}
