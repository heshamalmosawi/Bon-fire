"use client";

import React, { ChangeEvent, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

const CreatePost = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [postVisibility, setPostVisibility] = useState("public");
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [selectedFollowers, setSelectedFollowers] = useState<string[]>([]);
  const { toast } = useToast();

  // Sample followers list for demonstration purposes
  const followers = [
    { id: "1", name: "John Doe" },
    { id: "2", name: "Jane Smith" },
    { id: "3", name: "Alice Johnson" },
    { id: "4", name: "Michael Brown" },
  ];

  const form = useForm<z.infer<typeof createPostSchema>>({
    resolver: zodResolver(createPostSchema),
  });

  const onSubmit = async (values: z.infer<typeof createPostSchema>) => {
    try {
      const payload = {
        ...values,
        visibility: postVisibility,
        selectedFollowers,
      };
      const payload = {
        ...values,
        visibility: postVisibility,
        selectedFollowers,
      };
      await HandleCreatePost(payload);

      setIsDialogOpen(false);
    } catch (error) {
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

  const handleSelectFollower = (followerId: string) => {
    setSelectedFollowers((prev) =>
      prev.includes(followerId)
        ? prev.filter((id) => id !== followerId)
        : [...prev, followerId]
    );
  };

  return (
    <>
      <Dialog
        open={isDialogOpen}
        onOpenChange={() => setIsDialogOpen(!isDialogOpen)}
      >
        <DialogTrigger onClick={() => setIsDialogOpen(true)}>
          <div className="cursor-pointer w-[570px] bg-black h-fit flex items-center justify-start gap-4 py-2 px-4 rounded-lg">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <h1 className="text-[#ffffff66]">What's new?</h1>
          </div>
        </DialogTrigger>
        <DialogContent className="text-white bg-neutral-950 border-[#ffffff66] w-[870px] flex flex-col items-start justify-evenly">
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <h4 className="text-white font-bold">Abdulrahman Idrees</h4>
              <Select
                onValueChange={(value) => {
                  setPostVisibility(value);
                  if (value === "custom") {
                    setIsCustomModalOpen(true);
                  }
                }}
                value={postVisibility}
              >
                <SelectTrigger className="flex items-center justify-between w-[150px] mt-1 bg-neutral-800 border border-gray-600 rounded-lg px-4 py-2 text-white leading-none">
                  <SelectValue placeholder="Public Post" />
                </SelectTrigger>
                <SelectContent className="bg-neutral-800 border border-gray-600 rounded-lg mt-2 text-white">
                  <SelectItem
                    value="public"
                    className="flex items-center gap-2 px-4 py-2"
                  >
                    <div className="ml-3">Public</div>
                  </SelectItem>
                  <SelectItem
                    value="private"
                    className="flex items-center gap-2 px-4 py-2"
                  >
                    <div className="ml-3">Private</div>
                  </SelectItem>
                  <SelectItem
                    value="custom"
                    className="flex items-center gap-2 px-4 py-2"
                    onClick={() => {
                      setPostVisibility("custom");
                      setIsCustomModalOpen(true);
                    }}
                  >
                    <div className="ml-3">Custom</div>
                  </SelectItem>
                </SelectContent>
              </Select>
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
                <Select
                  onValueChange={(value) => {
                    setPostVisibility(value);
                    if (value === "custom") {
                      setIsCustomModalOpen(true);
                    }
                  }}
                  value={postVisibility}
                >
                  <SelectTrigger className="flex items-center justify-between w-[150px] mt-1 bg-neutral-800 border border-gray-600 rounded-lg px-4 py-2 text-white leading-none">
                    <SelectValue placeholder="Public Post" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-800 border border-gray-600 rounded-lg mt-2 text-white">
                    <SelectItem
                      value="public"
                      className="flex items-center gap-2 px-4 py-2"
                    >
                      <div className="ml-3">Public</div>
                    </SelectItem>
                    <SelectItem
                      value="private"
                      className="flex items-center gap-2 px-4 py-2"
                    >
                      <div className="ml-3">Private</div>
                    </SelectItem>
                    <SelectItem
                      value="custom"
                      className="flex items-center gap-2 px-4 py-2"
                      onClick={() => {
                        setPostVisibility("custom");
                        setIsCustomModalOpen(true);
                      }}
                    >
                      <div className="ml-3">Custom</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full flex items-center justify-end gap-5">
                {postVisibility === "custom" && (
                  <Button
                    className="ml-2 text-white"
                    onClick={() => setIsCustomModalOpen(true)}
                  >
                    Edit Followers Selection
                  </Button>
                )}
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCustomModalOpen}
        onOpenChange={() => setIsCustomModalOpen(!isCustomModalOpen)}
      >
        <DialogContent className="text-white bg-neutral-950 border-[#ffffff66] w-[570px] flex flex-col items-start justify-evenly">
          <DialogHeader>
            <DialogTitle>Select Followers</DialogTitle>
            <DialogDescription>
              Select followers to view this post.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="w-full h-48">
            {followers.map((follower) => (
              <div key={follower.id} className="flex items-center gap-2 mb-2">
                <Checkbox
                  checked={selectedFollowers.includes(follower.id)}
                  onCheckedChange={() => handleSelectFollower(follower.id)}
                  id={`follower-${follower.id}`}
                />
                <label
                  htmlFor={`follower-${follower.id}`}
                  className="text-white"
                >
                  {follower.name}
                </label>
              </div>
            ))}
          </ScrollArea>
          <div className="w-full flex items-center justify-end mt-4">
            <Button onClick={() => setIsCustomModalOpen(false)}>Done</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CreatePost;
