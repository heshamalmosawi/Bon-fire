"use client";

import React, { useEffect, useState } from "react";
import {
  ProfileComponent,
  PeopleList,
} from "@/components/desktop/ProfileComponent";
import PostComponent from "@/components/desktop/PostComponent";
import Navbar from "@/components/desktop/Navbar";
import { notFound, usePathname, useRouter } from "next/navigation";
import { fetchProfile, fetchSessionUser, handleClick } from "@/lib/api";
import { Profile } from "@/lib/interfaces";
import Banner from "/public/banner.jpg";

const ProfilePage = () => {
  const [sessionUser, setSessionUser] = useState("");
  const [profile, setProfile] = useState<Profile>({
    fname: "",
    lname: "",
    email: "",
    dob: "",
    avatarUrl: "",
    bio: "",
    nickname: "",
    privacy: "",
    is_followed: false,
    is_requested: false,
  });

  // just used as a flag.
  let [fetched, setFetched] = useState(false);

  const pathname = usePathname();
  const [u_id, setU_id] = useState(pathname.split("/")[2]);
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    const getSessionUser = async () => {
      const data = await fetchSessionUser();
      if (!data && u_id === undefined) {
        router.push("/auth");
        return;
      } else if (data && data.status === 200) {
        // if user is authenticated and u_id is defined in URL
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
  }, [router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!u_id) {
        return;
      }
      setLoading(true);
      console.log("fetching data, u_id:", u_id);
      if (u_id !== undefined) {
        await fetchProfile(u_id, setProfile, setLoading, setError);
        setFetched(true);
        handleClick("posts", u_id, setLoading, setError, setActiveTab, setData);
      }
    };

    fetchData();
  }, [u_id]);

  if (fetched && profile.privacy === "") {
    notFound();
  }

  useEffect(() => {
    console.log(data);
    if (!data || !data.user) {
      return;
    } else if (data.user) {
      console.log("first set", data.user.is_requested);
    }
    setProfile({
      ...profile,
      is_followed: data.user.is_followed,
      is_requested: data.user.is_requested,
    });
  }, [data]);

  const renderContent = () => {
    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;
    console.log("data:", data, Array.isArray(data), data);

    // data response only returns private, if the public is private and the user is not the user in session
    if (data && data.response === "Private") {
      console.log("request:", data.user.is_requested);
      setProfile({
        ...profile,
        privacy: "Private",
        is_followed: data.user.is_followed,
        is_requested: data.user.is_requested,
      }); // unnecessary but just in case
      return <p>This user's profile is private</p>;
    }

    switch (activeTab) {
      case "posts":
        return data.response ? (
          data.response.map((post: any) => (
            <PostComponent
              key={post.Post.post_id}
              id={post.Post.post_id}
              firstName={post.Author.user_fname}
              lastName={post.Author.user_lname}
              username={post.Author.user_nickname}
              avatarUrl={post.Author.user_avatar_path}
              created_at={post.Post.created_at}
              post_content={post.Post.post_content}
              post_image_path={post.Post.post_image_path}
              post_likecount={post.Post.post_likecount}
              postIsLiked={post.Post.is_liked}
              postCommentNum={post.Post.comments ? post.Post.comments.length : 0}
            />
          ))
        ) : (
          <p>No posts available.</p>
        );
      case "comments":
        return data.response ? (
          data.response.map((post: any) => (
            <PostComponent
              key={post.Post.post_id}
              id={post.Post.post_id}
              firstName={post.Author.user_fname}
              lastName={post.Author.user_lname}
              username={post.Author.user_nickname}
              avatarUrl={post.Author.user_avatar_path}
              created_at={post.Post.created_at}
              post_content={post.Post.post_content}
              post_image_path={post.Post.post_image_path}
              post_likecount={post.Post.post_likecount}
              postIsLiked={post.Post.is_liked}
              postCommentNum={post.Post.comments ? post.Post.comments.length : 0}
            />
          ))
        ) : (
          <p>No comments available</p>
        );
      case "likes":
        return data.response ? (
          data.response.map((post: any) => (
            <PostComponent
              key={post.Post.post_id}
              id={post.Post.post_id}
              firstName={post.Author.user_fname}
              lastName={post.Author.user_lname}
              username={post.Author.user_nickname}
              avatarUrl={post.Author.user_avatar_path}
              created_at={post.Post.created_at}
              post_content={post.Post.post_content}
              post_image_path={post.Post.post_image_path}
              post_likecount={post.Post.post_likecount}
              postIsLiked={post.Post.is_liked}
              postCommentNum={post.Post.comments ? post.Post.comments.length : 0}
            />
          ))
        ) : (
          <p>No likes available.</p>
        );
      case "followers":
        return data.response ? (
          <PeopleList
            onSelectPerson={data.response}
            session_user={data.user.user_id}
            save_changes={setData}
          />
        ) : (
          <p>No followers available.</p>
        );
      case "followings":
        console.log("data:", data);
        return data.response ? (
          <PeopleList
            onSelectPerson={data.response}
            session_user={data.user.user_id}
            save_changes={setData}
          />
        ) : (
          <p>No followings available.</p>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    const profileElement = document.getElementById("profile");
    console.log("profile element:", profileElement);

    const handleScroll = () => {
      console.log("scrolling");
      if (profileElement) {
        const rect = profileElement.getBoundingClientRect();
        if (rect.top <= 16) {
          profileElement.classList.add("sticky");
          profileElement.classList.add("top-4");
          profileElement.classList.remove("relative");
          profileElement.classList.remove("-top-24");
        } else {
          profileElement.classList.add("relative");
          profileElement.classList.add("-top-24");
          profileElement.classList.remove("sticky");
          profileElement.classList.remove("top-4");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const updateProf = (newprof: Profile) => {
    const x = profile.avatarUrl;
    setProfile({ ...newprof, avatarUrl: x });
  };

  return (
    <div className="bg-neutral-950 min-h-screen text-gray-200">
      <div className="flex">
        <Navbar />
        <main className="w-screen p-8">
          <div
            className={`h-56 bg-gray-200 rounded-lg flex items-center justify-center my-8`}
          >
            <img src={Banner.src} className="h-56 w-full object-cover rounded-lg" />
            {/* Placeholder content for background*/}
          </div>

          <div className="flex items-start space-x-6">
            {/* <!-- Profile Info --> */}
            <ProfileComponent
              {...profile}
              is_requested={profile.is_requested}
              session_user={sessionUser}
              u_id={u_id}
              save_changes={updateProf}
            />

            {/* <!-- Timeline --> */}
            {profile.privacy == "Public" ||
            u_id === sessionUser ||
            profile.is_followed ? (
              <div className="w-2/3 space-y-6">
                {/* <!-- Timeline Tabs --> */}
                <div className="flex space-x-6 border-b border-gray-700 pb-4">
                  <button
                    id="posts"
                    onClick={() =>
                      handleClick(
                        "posts",
                        u_id,
                        setLoading,
                        setError,
                        setActiveTab,
                        setData
                      )
                    }
                    className={`p-2 rounded-lg ${
                      activeTab === "posts"
                        ? "text-white bg-indigo-500"
                        : "text-gray-400"
                    }`}
                  >
                    Posts
                  </button>
                  <button
                    id="comments"
                    onClick={() =>
                      handleClick(
                        "comments",
                        u_id,
                        setLoading,
                        setError,
                        setActiveTab,
                        setData
                      )
                    }
                    className={`p-2 rounded-lg ${
                      activeTab === "comments"
                        ? "text-white bg-indigo-500"
                        : "text-gray-400"
                    }`}
                  >
                    Comments
                  </button>
                  <button
                    id="likes"
                    onClick={() =>
                      handleClick(
                        "likes",
                        u_id,
                        setLoading,
                        setError,
                        setActiveTab,
                        setData
                      )
                    }
                    className={`p-2 rounded-lg ${
                      activeTab === "likes"
                        ? "text-white bg-indigo-500"
                        : "text-gray-400"
                    }`}
                  >
                    Likes
                  </button>
                  <button
                    id="followers"
                    onClick={() =>
                      handleClick(
                        "followers",
                        u_id,
                        setLoading,
                        setError,
                        setActiveTab,
                        setData
                      )
                    }
                    className={`p-2 rounded-lg ${
                      activeTab === "followers"
                        ? "text-white bg-indigo-500"
                        : "text-gray-400"
                    }`}
                  >
                    Followers
                  </button>
                  <button
                    id="followings"
                    onClick={() =>
                      handleClick(
                        "followings",
                        u_id,
                        setLoading,
                        setError,
                        setActiveTab,
                        setData
                      )
                    }
                    className={`p-2 rounded-lg ${
                      activeTab === "followings"
                        ? "text-white bg-indigo-500"
                        : "text-gray-400"
                    }`}
                  >
                    Following
                  </button>
                </div>
                <div className="space-y-8" id="timeline">
                  {/* <PeopleList /> */}
                  {renderContent()}
                </div>
              </div>
            ) : (
              <p className="text-3xl bg-black p-4 rounded-lg">
                {" "}
                Profile is private.{" "}
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
