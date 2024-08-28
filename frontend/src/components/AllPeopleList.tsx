import React from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Forward, Heart, MessageSquare } from "lucide-react";
// import ToolTipWrapper from "../ToolTipWrapper";


const people = [
  {
    name: 'Carter Philips',
    location: 'New York, USA',
    profileViews: '11,253',
    followers: '1,093',
    projects: '12 Projects',
    rating: 4.8,
    imageSrc: '/path-to-image1.jpg',
  },
  {
    name: 'Wilson Bergson',
    location: 'New York, USA',
    profileViews: '11,253',
    followers: '1,093',
    projects: '12 Projects',
    rating: 4.8,
    imageSrc: '/path-to-image2.jpg',
  },
  // Add more people as needed
];

const AllPeopleList = () => {
  return (
    // <div className="min-h-screen bg-black p-6">
      <div className="ml-1/4 p-2">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl text-white">People (166)</h2>
          {/* <button className="bg-blue-600 text-white px-4 py-2 rounded">Add New User</button> */}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-black rounded-lg overflow-hidden shadow-md text-white">
            <Image
              src="/profile1.jpg"
              alt="Carter Philips"
              width={300}
              height={200}
              className="w-full h-48 object-cover"
            />
            <div className="p-4">
              <h3 className="text-lg font-semibold">Carter Philips</h3>
              {/* <p className="text-sm text-gray-400">New York, USA</p> */}
              <div className="mt-2 text-sm">
                <p>Public</p>
                {/* <p>Followers: 1,093</p>
                <p>Projects Done: 12 Projects</p> */}
                {/* <p className="flex items-center mt-2">
                  <span className="text-yellow-500">★ 4.8 </span>
                  <span className="text-gray-500 ml-2">(4.8 of 5.0)</span>
                </p> */}
              </div>
              <button className="mt-4 bg-blue-600 text-white w-full py-2 rounded">
                Follow
              </button>
            </div>
          </div>

        </div>
      </div>
    // </div> 
  );
}

export default AllPeopleList;
