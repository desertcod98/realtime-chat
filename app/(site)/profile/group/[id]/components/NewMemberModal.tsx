"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { AiOutlinePlus } from "@react-icons/all-files/ai/AiOutlinePlus";
import { z } from "zod";

const formSchema = z.object({
  userEmail: z.string().min(1),
});

interface NewMemberModalProps {
  open: boolean;
  setIsOpen: (open: boolean) => void;
  chatId: string;
}

export default function NewMemberModal({
  open,
  setIsOpen,
  chatId
}: NewMemberModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userEmail: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function onSubmit(data: z.infer<typeof formSchema>) {
    fetch("/api/invite/"+chatId, {
      method: "POST",
      body: JSON.stringify(data),
    }).then((res) => {
      if (res.status !== 200) {
        res.text().then((error) => toast.error(error));
      } else {
        toast.success("User invited!");
        setIsOpen(false);
      }
    });
  }

  return (
    <Dialog
      onOpenChange={() => {
        form.reset();
        setIsOpen(false);
      }}
      open={open}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add new member</DialogTitle>
          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="userEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User email</FormLabel>
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
              <Button type="submit" disabled={isLoading}>
                Invite
              </Button>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
