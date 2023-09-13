"use client";

import UploadProfilePic from "@/app/login/components/UploadProfilePic";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { AiOutlinePlus } from "@react-icons/all-files/ai/AiOutlinePlus";
import { z } from "zod";

// const formSchema = z.object({
//   userEmail: z.string().min(1),
//   isGroup: z.boolean(),
//   groupName: z.string().min(1).optional(), //TODO finish
// });

const formSchema = z.discriminatedUnion("isGroup", [
  z.object({
    isGroup: z.literal(false),
    userEmail: z.string().min(1),
  }),
  z.object({
    isGroup: z.literal(true),
    groupName: z.string().min(1),
    groupDescription: z
      .union([z.string().length(0), z.string().min(1)])
      .optional()
      .transform((e) => (e === "" ? undefined : e)),
  }),
]);

export default function NewChatDialog() {
  const [open, setIsOpen] = useState(false);
  const router = useRouter();
  const [isGroup, setIsGroup] = useState(false);
  const [imgUrl, setImgUrl] = useState<string>();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userEmail: "",
      //@ts-ignore
      groupDescription: "",
      groupName: "",
      isGroup: false,
    },
  });

  const isLoading = form.formState.isSubmitting;

  function onSubmit(data: z.infer<typeof formSchema>) {
    fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify(
        !isGroup
          ? data
          : {
              ...data,
              imgUrl,
            }
      ),
    }).then((res) => {
      if (res.status !== 200) {
        res.text().then((error) => toast.error(error));
      } else {
        toast.success("Chat created!");
        router.refresh();
        setIsOpen(false);
      }
    });
  }
  return (
  <>
  <AiOutlinePlus size={35} className="opacity-80 cursor-pointer" onClick={() => setIsOpen(true)}/>
  <Dialog
      onOpenChange={() => {
        form.reset();
        setIsGroup(false);
        setIsOpen(false);
      }}
      open={open}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new chat</DialogTitle>
          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="isGroup"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow mt-5">
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
                      <FormLabel>Group chat</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
              {!isGroup ? (
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
              ) : (
                <>
                  <FormField
                    control={form.control}
                    name="groupName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group name</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            {...field}
                            placeholder="example name"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="groupDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Group description</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            {...field}
                            placeholder="example description"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <UploadProfilePic imgUrl={imgUrl} setImgUrl={setImgUrl} />
                </>
              )}
              <Button type="submit" disabled={isLoading}>Create</Button>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  </>
    
  );
}
