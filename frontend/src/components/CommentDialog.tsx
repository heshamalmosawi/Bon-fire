import React, { useState } from "react"; 
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAgo } from "@/lib/utils";
import { Heart, Send } from "lucide-react";
import {PostProps} from "@/lib/interfaces";

interface CommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostProps;
}


export const CommentDialog: React.FC<CommentDialogProps> = ({ isOpen, onClose, post }) => {
    // Example state for likes
    const [likes, setLikes] = useState(23);
    const [liked, setLiked] = useState(false);
  
    const toggleLike = () => {
      setLiked(!liked);
      setLikes(liked ? likes - 1 : likes + 1);
    };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black rounded-lg p-0 max-w-6xl mx-auto flex overflow-hidden  h-[90vh]">
        {/* Left Section - Placeholder or Image */}
        <div className="flex-1 bg-gray-800 flex items-center justify-center">
          (
            <Image
              src="/landing.jpg"  // Use the dynamic image URL
              alt="post image"
              width={700}
              height={900}
              className="object-cover h-full w-full"
            />
          ) 
        </div>

         {/* Right Section - Comments and Details */}
         <div className="flex-1 flex flex-col justify-between p-6 bg-black overflow-y-auto">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src={post.avatarUrl} />
                <AvatarFallback>{`${post.firstName[0]}${post.lastName[0]}`}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <h2 className="text-white font-bold">{`${post.firstName} ${post.lastName}`}</h2>
                <h6 className="text-[#ffffff66]">
                  {post.username ? `@${post.username}` : ""} | {getAgo(post.creationDate)}
                </h6>
              </div>
            </div>
            <div className="text-white text-sm">{post.postTextContent}</div>
            {/* Example Comments */}
            <div className="mt-4 space-y-4 max-h-[300px] overflow-y-auto">
              <div className="flex gap-2">
                <Avatar>
                  <AvatarImage src="/path/to/user/avatar.jpg" />
                  <AvatarFallback>AV</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <h6 className="text-white font-semibold">Allison Vaccaro</h6>
                  <p className="text-[#ffffff66]">This city looks amazing, the buildings, nature, people all are beautiful, I highly recommend to visit!</p>
                  <div className="flex items-center gap-4 text-xs text-[#ffffff66] mt-2">
                    <div className="flex items-center gap-1 cursor-pointer" onClick={toggleLike}>
                      <Heart className={`w-4 h-4 ${liked ? "text-red-600 fill-current" : "text-white"}`} />
                      <span>{likes} Likes</span>
                    </div>

                  </div>
                </div>
              </div>
              {/* Additional comments can be added here */}
            </div>
          </div>
          <div className="mt-4">
            <Input
              className="w-full bg-transparent text-white border-[0.1px] border-[#3838386f] mt-4"
              placeholder="Add a comment..."
            />
            <div className="flex justify-end mt-4">
              <Button variant="ghost" className="text-white flex items-center gap-2">
                <Send size={16} /> Submit
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;