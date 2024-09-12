import React, { FC, useEffect, useState } from "react";
import PostComponent from "./PostComponent";
import CreatePost from "../CreatePost";
import EventsList from "./EventsList";
import BirthdayList from "./BirthdayList";
import { getFeed } from "@/lib/queries/feed";
import { useToast } from "../ui/use-toast";
import Joyride, { CallBackProps, ACTIONS, EVENTS, STATUS } from "react-joyride";
import { PostProps } from "@/lib/interfaces"; // Ensure you have this import if you're using PostProps

interface HtmlContentProps {
  html: string; // Specify that 'html' should be a string
}

const HtmlContent: React.FC<HtmlContentProps> = ({ html }) => (
  <div dangerouslySetInnerHTML={{ __html: html }} />
);

const FeedDesktop: FC = () => {
  const { toast } = useToast();
  const [posts, setPosts] = useState<PostProps[]>([]);
  const [newPost, setNewPost] = useState(false);
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    const tourStatus = localStorage.getItem("tourCompleted");
    setRunTour(!tourStatus);
    fetchFeed();
  }, [newPost]);

  const fetchFeed = async () => {
    try {
      const data = await getFeed();
      if (typeof data === "string") {
        toast({
          variant: "destructive",
          title: "Error",
          description: `There was an error getting your feed: ${data}`,
        });
      } else {
        setPosts(data || []); // Handle undefined data
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fetch Error",
        description: "An error occurred while fetching the feed.",
      });
    }
  };

  const handleTourCompleted = (data: CallBackProps) => {
    const { status } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem("tourCompleted", "true");
      setRunTour(false);
    }
  };

  const steps = [
    {
      target: ".navbar",
      content: (
        <HtmlContent
          html={`Navigate your options from here. <br><img src="/browse.gif" alt="Navigation Help" style="width:150px; height:auto;">`}
        />
      ),
      placement: "right" as const, // Adjust based on desired appearance
      offset: 10, // Distance from target
    },
    {
      target: ".add-post",
      content: (
        <HtmlContent
          html={`Interact and post here! <br><img src="/post.gif" alt="Navigation Help" style="width:150px; height:auto;">`}
        />
      ),
      placement: "right" as const, // Adjust based on desired appearance
      offset: 10, // Distance from target
    },
    {
      target: "#right-nav",
      content: (
        <HtmlContent
          html={`Your groups and messages appear here. <br><img src="/chat.png" alt="Navigation Help" style="width:200px; height:auto; margin:auto;">`}
        />
      ),
      placement: "left" as const, // Adjust based on desired appearance
      offset: 10, // Distance from target
    },
  ];

  return (
    <div className="w-screen h-screen flex items-center justify-evenly bg-neutral-950">
      {runTour && (
        <Joyride
          callback={handleTourCompleted}
          steps={steps}
          continuous={true}
          scrollToFirstStep={true}
          showProgress={true}
          showSkipButton={true}
          styles={tourStyles}
        />
      )}
      <div className="w-[70%] h-full px-5 py-10 space-y-8 overflow-y-scroll add-post">
        <CreatePost onPostCreated={() => setNewPost(true)} />
        {posts.length ? (
          posts.map((post) => <PostComponent {...post} key={post.id} />)
        ) : (
          <h1 className="text-center text-white">No posts found</h1>
        )}
      </div>
      <div className="w-[30%] h-full flex flex-col items-center justify-center gap-7">
        <EventsList />
        <BirthdayList />
      </div>
    </div>
  );
};

export default FeedDesktop;

const tourStyles = {
  options: {
    zIndex: 1000,
    arrowColor: "#000", // Matches the background
    backgroundColor: "#000", // Black background for the tooltip
    textColor: "#fff", // White text color
    overlayColor: "rgba(0, 0, 0, 0.9)", // Dark overlay
  },
  tooltip: {
    maxWidth: "500px", // Wider tooltip for more horizontal appearance
    width: "auto", // Adjust based on content
    border: "1px solid #fff", // White border for the tooltip
    boxShadow: "0px 0px 10px rgba(255, 255, 255, 0.5)", // Adding shadow
  },
  tooltipContainer: {
    textAlign: "left" as const, // Ensure text alignment is consistent
  },
  buttonNext: {
    backgroundColor: "white",
    color: "black",
  },
  buttonBack: {
    color: "white",
  },
  buttonSkip: {
    color: "white",
  },
};
