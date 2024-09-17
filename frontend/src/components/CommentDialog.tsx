import React, { ChangeEvent, ReactNode, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
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
import CommentComponent from "./desktop/CommentComponent";

interface CommentDialogProps {
  children: ReactNode;
  post: PostProps;
}

export const CommentDialog: React.FC<CommentDialogProps> = ({
  children,
  post,
}) => {
  const [likes, setLikes] = useState(0);
  const [comments, setcomments] = useState<CommentModel[]>();
  const [liked, setLiked] = useState(false);
  const [created, setcreated] = useState(false);
  const [loading, setloading] = useState(false);
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
      setloading(true);
      await HandleCommentCreation(values);
      form.reset();
      setcreated(true);
      setloading(false);
    } catch (error) {
      setloading(false);
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
          setcreated(false);
        }
      }
    });
  }, [post.id, created]);

  const firstNameInitial = post.firstName.charAt(0);
  const lastNameInitial = post.lastName.charAt(0);

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-black rounded-lg p-0 max-w-6xl mx-auto flex overflow-hidden h-[90vh]">
        {/* Left Section - Placeholder or Image */}
        <DialogTitle>{/* Empty because it used to give error in console of no dialog title??*/}</DialogTitle>
        <div className="flex-1 bg-black flex items-center justify-center">
          <Image
            src={post.post_image_path ? post.post_image_path : "/landing.jpg"}
            alt="post image"
            width={700}
            height={900}
            className="object-cover max-h-full max-w-full "
          />
        </div>
        {/* Right Section - Comments and Details */}
        <div className="flex-1 flex flex-col justify-between p-6 bg-black overflow-y-auto relative">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={post.avatarUrl} />
                <AvatarFallback>{`${firstNameInitial}${lastNameInitial}`}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h2 className="text-white font-bold">{`${post.firstName} ${post.lastName}`}</h2>
                <h6 className="text-[#ffffff66]">
                  {post.username ? `@${post.username}` : ""} |{" "}
                  {getAgo(post.created_at)}
                </h6>
              </div>
            </div>
            <div className="text-white text-sm break-all"
            dangerouslySetInnerHTML={{ __html: post.post_content.replace(/\n/g, "<br/>") }}></div>
            <div className="mt-4 space-y-7 h-[400px] overflow-y-auto">
              {comments ? (
                comments.map((item) => <CommentComponent {...item} />)
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="w-full flex items-center justify-between">
            <div className="flex gap-2">
              <Heart
                color="white"
                className={`cursor-pointer hover:stroke-red-300 duration-300 ${
                  liked ? "stroke-red-600" : "stroke-white"
                }`}
              />
              <h6 className="text-white font-bold">
                {post.post_likecount}{" "}
                {post.post_likecount > 1 ? "likes" : "like"}
              </h6>
            </div>
            <h6 className="text-neutral-500 text-sm">
              {post.postCommentNum}{" "}
              {post.postCommentNum > 1 ? "Comments" : "Comment"}
            </h6>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="w-full flex items-center justify-around gap-3 mt-2"
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
