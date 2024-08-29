"use client";

import React, { FC, useEffect, useState } from "react";
import PostComponent from "./PostComponent";
import CreatePost from "../CreatePost";
import EventsList from "./EventsList";
import { useToast } from "../ui/use-toast";
import { getFeed } from "@/lib/queries/feed";

const FeedDesktop: FC = () => {
  const { toast } = useToast();
  const [posts, setposts] = useState<PostProps[]>();
  const [newPost, setNewPost] = useState(false);

  const fetchFeed = () => {
    getFeed().then((data) => {
      if (typeof data === "string") {
        toast({
          variant: "destructive",
          title: "Error",
          description: `There was an error getting your feed: ${data}`,
        });
      } else {
        setposts(data);
      }
    });
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  useEffect(() => {
    if (newPost) {
      fetchFeed();
      setNewPost(false);
    }
  }, [newPost]);

  return (
    <div className="w-3/4 h-full flex items-center justify-center">
      <div className="w-[70%] h-full px-5 py-10 space-y-8 overflow-y-scroll">
        <CreatePost onPostCreated={() => setNewPost(true)} />
        {posts ? (
          posts.map((post) => <PostComponent {...post} key={post.id} />)
        ) : (
          <h1 className="w-full h-[80%] text-white flex items-center justify-center text-4xl font-bold">
            Cricket Noises :/
          </h1>
        )}
      </div>
      <div className="w-[30%] h-full flex flex-col items-center justify-around">
        <EventsList />
      </div>
    </div>
  );
};

export default FeedDesktop;
