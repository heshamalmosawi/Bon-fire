import React, { FC } from "react";
import PostComponent from "./PostComponent";
import CreatePost from "../CreatePost";
import EventsList from "./EventsList";

const FeedDesktop: FC = () => {
  return (
    <div className="w-[60%] h-full flex items-center justify-center">
      <div className="w-[70%] h-full px-5 py-10 space-y-8 overflow-y-scroll">
        <CreatePost />
        <PostComponent />
        <PostComponent />
        <PostComponent />
        <PostComponent />
        <PostComponent />
      </div>
      <div className="w-[30%] h-full flex flex-col items-center justify-around">
        <EventsList />
      </div>
    </div>
  );
};

export default FeedDesktop;
