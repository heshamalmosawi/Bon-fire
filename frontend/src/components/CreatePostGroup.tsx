"use client";

import React, { ChangeEvent, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import {
  createPostSchema,
  HandleCreatePost,
} from "@/lib/schemas/createPostSchema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "./ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Images } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { fetchProfile } from "@/lib/api";

const CreatePostForGroup = ({
  groupID,
  onPostCreated,
}: {
  groupID: string;
  onPostCreated: () => void;
}) => {
  const [sessionUser, setSessionUser] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [User, setProfile] = useState<{
    fname: string;
    lname: string;
    avatarUrl: string;
    bio: string;
    nickname: string;
    privacy: string;
  }>({
    fname: "",
    lname: "",
    avatarUrl: "",
    bio: "",
    nickname: "",
    privacy: "",
  });
  const { toast } = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Authenticate and fetch user data
  useEffect(() => {
    const authenticate = async () => {
      const response = await fetch(`http://localhost:8080/authenticate`, {
        method: "POST",
        credentials: "include",
      });

      if (response.status !== 200) {
        router.push("/auth");
        return;
      }

      const data = await response.json();
      setSessionUser(data.User.user_id);

      // Fetch user profile using the authenticated user ID
      await fetchProfile(data.User.user_id, setProfile, setLoading, setError);
    };

    authenticate();
  }, [router]);

  const form = useForm<z.infer<typeof createPostSchema>>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      groupId: groupID,
    },
  });

  const onSubmit = async (values: z.infer<typeof createPostSchema>) => {
    console.log("Form Submitted", values);
    try {
      const payload = {
        ...values,
        post_exposure: "group", // Privacy is automatically set to "group"
        groupId: groupID, // Group ID passed from the props
      };

      setSubmitting(true);
      await HandleCreatePost(values);

      setIsDialogOpen(false);
      setSubmitting(false);
      onPostCreated();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        variant: "destructive",
        title: "Error creating post",
        description: "Our servers did not create the post properly",
      });
    }
  };

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      form.setValue("imageContent", file);
    }
  };

  return (
    <>
      <Dialog
        open={isDialogOpen}
        onOpenChange={() => setIsDialogOpen(!isDialogOpen)}
      >
        <DialogTrigger className="w-full" onClick={() => setIsDialogOpen(true)}>
          <div className="cursor-pointer bg-black h-fit flex items-center justify-start gap-4 py-2 px-4 rounded-lg mb-7">
            <Avatar>
              <AvatarImage src={User.avatarUrl} />
              <AvatarFallback>
                {User.fname.charAt(0)}
                {User.lname.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-[#ffffff66]">What's new in the group?</h1>
          </div>
        </DialogTrigger>
        <DialogContent className="text-white bg-neutral-950 border-[#ffffff66] w-[870px] flex flex-col items-start justify-evenly">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={User.avatarUrl} />
              <AvatarFallback>
                {User.fname.charAt(0)}
                {User.lname.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h4 className="text-white font-bold">
                {User.fname} {User.lname}
              </h4>
              <h6 className="text-[#ffffff66]">@{User.nickname}</h6>
            </div>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full space-y-8"
            >
              <FormField
                control={form.control}
                name="textContent"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        className="bg-transparent border-0 h-16"
                        placeholder="What's on your mind?"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageContent"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="file"
                        id="post-image-input"
                        className="hidden"
                        onChange={handleImageSelection}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="w-full h-fit flex items-center justify-start gap-5">
                <Images
                  onClick={() =>
                    document.getElementById("post-image-input")?.click()
                  }
                  className="cursor-pointer"
                />
              </div>
              <div className="w-full flex items-center justify-end gap-5">
                <Button type="submit" disabled={submitting}>Submit</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreatePostForGroup;
