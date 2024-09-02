import React, { ChangeEvent, useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAgo } from "@/lib/utils";
import { Heart, Images, Send } from "lucide-react";
import { CommentModel, PostProps } from "@/lib/interfaces";
import { getComments } from "@/lib/queries/comment";
import { useToast } from "./ui/use-toast";
import { useForm } from "react-hook-form";
import {
  CommentCreationSchema,
  HandleCommentCreation,
} from "@/lib/schemas/createCommentSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostProps;
}

export const CommentDialog: React.FC<CommentDialogProps> = ({
  isOpen,
  onClose,
  post,
}) => {
  const [likes, setLikes] = useState(0);
  const [comments, setcomments] = useState<CommentModel[]>();
  const [liked, setLiked] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof CommentCreationSchema>>({
    resolver: zodResolver(CommentCreationSchema),
    defaultValues: {
      post_id: post.id,
      comment_content: "",
      comment_image_path: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof CommentCreationSchema>) => {
    console.log("Form Submitted", values); // Add this line
    try {
      await HandleCommentCreation(values);
      form.reset();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "there was an error creating comments",
      });
    }
  };

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      form.setValue("comment_image_path", file);
    }
  };

  const toggleLike = () => {
    setLiked(!liked);
    setLikes(liked ? likes - 1 : likes + 1);
  };

  useEffect(() => {
    getComments(post.id).then((data) => {
      if (data) {
        if (typeof data === "string") {
          toast({
            variant: "destructive",
            title: "Error",
            description: `There was an error getting the comments`,
          });
        } else {
          setcomments(data);
        }
      }
    });
  }, [post.id]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black rounded-lg p-0 max-w-6xl mx-auto flex overflow-hidden h-[90vh]">
        {/* Left Section - Placeholder or Image */}
        <div className="flex-1 bg-gray-800 flex items-center justify-center">
          <Image
            src="/landing.jpg"
            alt="post image"
            width={700}
            height={900}
            className="object-cover h-full w-full"
          />
        </div>
        {/* Right Section - Comments and Details */}
        <div className="flex-1 flex flex-col justify-between p-6 bg-black overflow-y-auto relative">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={post.avatarUrl} />
                <AvatarFallback>{`${post.firstName[0]}${post.lastName[0]}`}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h2 className="text-white font-bold">{`${post.firstName} ${post.lastName}`}</h2>
                <h6 className="text-[#ffffff66]">
                  {post.username ? `@${post.username}` : ""} |{" "}
                  {getAgo(post.creationDate)}
                </h6>
              </div>
            </div>
            <div className="text-white text-sm">{post.postTextContent}</div>
            <div className="mt-4 space-y-7 h-[400px] overflow-y-auto">
              {comments ? (
                comments.map((item) => (
                  <div className="flex gap-2">
                    <Avatar>
                      <AvatarImage src={item.full_user.user_avatar_path} />
                      <AvatarFallback>
                        {item.full_user.user_fname[0]}
                        {item.full_user.user_lname[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <h6 className="text-white font-semibold">
                        {item.full_user.user_fname} {item.full_user.user_lname}
                      </h6>
                      <p className="text-[#ffffff66]">{item.comment_content}</p>
                      {item.comment_image_path && (
                        <Image
                          src={item.comment_image_path}
                          alt="comment image"
                          width={70}
                          height={70}
                          className="object-cover h-[200px] w-[150px] rounded-lg"
                        />
                      )}
                      <div className="flex items-center gap-4 text-xs text-[#ffffff66] mt-2">
                        <div
                          className="flex items-center gap-1 cursor-pointer"
                          onClick={toggleLike}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              liked ? "text-red-600 fill-current" : "text-white"
                            }`}
                          />
                          <span>{item.comment_likecount} Likes</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <></>
              )}
            </div>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full flex items-center justify-around gap-3 mt-4"
            >
              <FormField
                control={form.control}
                name="comment_content"
                render={({ field }) => (
                  <FormItem className="w-[80%]">
                    <FormControl>
                      <Input
                        className="bg-transparent text-white border-[0.1px] border-[#3838386f]"
                        placeholder="Add a comment..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="comment_image_path"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        type="file"
                        id="comment-image-input"
                        className="hidden"
                        onChange={handleImageSelection}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Images
                onClick={() =>
                  document.getElementById("comment-image-input")?.click()
                }
                size={26}
                color="white"
                className="cursor-pointer"
              />
              <Button
                variant="ghost"
                type="submit"
                className="text-white flex items-center gap-2"
              >
                <Send size={16} /> Submit
              </Button>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;
