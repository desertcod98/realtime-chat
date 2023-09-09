"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  Form,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { AiOutlinePlus } from "react-icons/ai";
import { z } from "zod";

const formSchema = z.object({
  userEmail: z.string().min(1),
  // isGroup: z.boolean(),
  // groupName: z.string().min(1).optional(), //TODO finish
});

export default function NewChatDialog() {
  const router = useRouter();
  const [isGroup, setIsGroup] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userEmail: "",
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify(data),
    }).then((res) => {
      if (res.status !== 200) {
        res.text().then((error) => toast.error(error));
      } else {
        toast.success("Chat created!");
        router.refresh();
      }
    });
  }
  console.log(isGroup);
  return (
    <Dialog onOpenChange={() => form.reset()}>
      <DialogTrigger>
        <AiOutlinePlus size={35} className="opacity-80" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new chat</DialogTitle>
          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              {/* <FormField
                control={form.control}
                name="isGroup"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(e) => {
                          field.onChange(e);
                          setIsGroup((c) => !c);
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Use different settings for my mobile devices
                      </FormLabel>
                      <FormDescription>asd</FormDescription>
                    </div>
                  </FormItem>
                )}
              /> */}
              <FormField
                control={form.control}
                name="userEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User email:</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        {...field}
                        placeholder="example@example.com"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit">Create</Button>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
