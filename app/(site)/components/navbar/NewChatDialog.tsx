"use client";

import { Button } from "@/components/ui/button";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { AiOutlinePlus } from "react-icons/ai";
import { z } from "zod";

const formSchema = z.object({
  userEmail: z.string().min(1),
});

export default function NewChatDialog() {
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
      }
    });
  }

  return (
    <Dialog>
      <DialogTrigger>
        <AiOutlinePlus size={35} className="opacity-80" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new chat</DialogTitle>
          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
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
