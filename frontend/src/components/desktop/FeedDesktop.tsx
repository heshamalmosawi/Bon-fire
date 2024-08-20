import React, { FC } from "react";
import PostComponent from "./PostComponent";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import CreatePost from "../CreatePost";

const FeedDesktop: FC = () => {
  return (
    <div className="w-[80%] h-full flex items-center justify-center">
      <div className="w-[70%] h-full px-5 py-10 space-y-8 overflow-y-scroll">
        <CreatePost />
        <PostComponent />
        <PostComponent />
        <PostComponent />
        <PostComponent />
        <PostComponent />
      </div>
      <div className="w-[30%] h-full"></div>
    </div>
  );
};

export default FeedDesktop;
