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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { usePathname, useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  fetchProfile,
  fetchSessionUser,
  getFollowers,
  handleClick,
} from "@/lib/api";
import { Follower } from "@/lib/interfaces";

const CreatePost = ({ onPostCreated }: { onPostCreated: () => void }) => {
  const [sessionUser, setSessionUser] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [postVisibility, setPostVisibility] = useState("Public");
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [selectedFollowers, setSelectedFollowers] = useState<string[]>([]);
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setsubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("posts");
  const router = useRouter();

  const pathname = usePathname();
  const [u_id, setU_id] = useState<string | undefined>(undefined);
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

  useEffect(() => {
    if (sessionUser) {
      getFollowers(sessionUser).then((data) => {
        if (data) {
          setFollowers(data);
        }
      });
    }
  }, [sessionUser]);

  useEffect(() => {
    const getSessionUser = async () => {
      const data = await fetchSessionUser();
      // console.log("user:", data, "status:", data.status);
      if (!data) {
        console.log(`Failed to authenticate user`);
        router.push("/auth");
        return;
      } else if (data.status === 200) {
        // if user is authenticated and u_id is defined in URL
        // const data = await user.json();
        console.log("authentication data:", data.User.user_id);
        setSessionUser(data.User.user_id);
        console.log("u_id:", u_id);
        if (u_id === undefined) {
          setU_id(data.User.user_id);
          console.log("u_id after:", u_id, "user.user_id:", data.User.user_id);
        }
      }
    };

    getSessionUser();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      if (u_id !== undefined) {
        await fetchProfile(u_id, setProfile, setLoading, setError);
        handleClick(
          "followers",
          u_id,
          setLoading,
          setError,
          setActiveTab,
          setData
        );
      }
    };
    fetchData();
  }, [u_id]);

  const form = useForm<z.infer<typeof createPostSchema>>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      textContent: "",
      imageContent: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof createPostSchema>) => {
    try {
      console.log("visibility:", postVisibility);
      const payload = {
        ...values,
        visibility: postVisibility,
        selectedFollowers,
      };
      setsubmitting(true)
      await HandleCreatePost(payload);

      setIsDialogOpen(false);
      setsubmitting(false);
      form.reset();
      onPostCreated();
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
    setSelectedFollowers((prevSelected) =>
      prevSelected.includes(followerId)
        ? prevSelected.filter((id) => id !== followerId)
        : [...prevSelected, followerId]
    );
  };

  return (
    <>
      <Dialog
        open={isDialogOpen}
        onOpenChange={() => setIsDialogOpen(!isDialogOpen)}
      >
        <DialogTrigger className="w-full" onClick={() => setIsDialogOpen(true)}>
          <div className="cursor-pointer bg-black h-fit flex items-center justify-start gap-4 py-2 px-4 rounded-lg">
            <Avatar>
              <AvatarImage src={User.avatarUrl} />
              <AvatarFallback>
                {User.fname.charAt(0)}
                {User.lname.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-[#ffffff66]">What's new?</h1>
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
                        className="bg-transparent border-0 h-16 whitespace-pre-wrap"
                        placeholder="What's on your mind?"
                        {...field}
                        // required
                        // style={{ whiteSpace: "pre-wrap" }}
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
                    if (value === "Custom") {
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
                      value="Public"
                      className="flex items-center gap-2 px-4 py-2"
                    >
                      <div className="ml-3">Public</div>
                    </SelectItem>
                    <SelectItem
                      value="Private"
                      className="flex items-center gap-2 px-4 py-2"
                    >
                      <div className="ml-3">Private</div>
                    </SelectItem>
                    <SelectItem
                      value="Custom"
                      className="flex items-center gap-2 px-4 py-2"
                      onClick={() => {
                        setPostVisibility("Custom");
                        setIsCustomModalOpen(true);
                      }}
                    >
                      <div className="ml-3">Custom</div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-full flex items-center justify-end gap-5">
                {postVisibility === "Custom" && (
                  <Button
                    className="ml-2 text-white bg-indigo-500 hover:bg-indigo-700"
                    onClick={() => setIsCustomModalOpen(true)}
                  >
                    Edit Followers Selection
                  </Button>
                )}
                <Button type="submit" className="bg-indigo-500 hover:bg-indigo-700" disabled={submitting}>Submit</Button>
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
