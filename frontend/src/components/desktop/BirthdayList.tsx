"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { fetchPeople } from "@/lib/api";

interface User {
  id: string;
  avatar: string;
  name: string;
  birthday: Date;
}

const BirthdayList = () => {
  const [users, setusers] = useState<User[]>();

  const isBirthdayToday = (birthday: Date) => {
    const today = new Date();
    return (
      birthday.getDate() === today.getDate() &&
      birthday.getMonth() === today.getMonth()
    );
  };

  const getDaysUntilBirthday = (birthday: Date) => {
    const today = new Date();
    const nextBirthday = new Date(
      today.getFullYear(),
      birthday.getMonth(),
      birthday.getDate()
    );

    if (today > nextBirthday) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    return Math.floor(
      (nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const sortedUsers = users?.sort(
    (a, b) =>
      getDaysUntilBirthday(b.birthday) - getDaysUntilBirthday(a.birthday)
  );

  const calculateAge = (birthday: Date): number => {
    const today = new Date();
    let age = today.getFullYear() - birthday.getFullYear();
    const monthDifference = today.getMonth() - birthday.getMonth();

    // Check if the birthday hasn't occurred yet this year
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthday.getDate())
    ) {
      age--;
    }

    return age;
  };

  useEffect(() => {
    fetchPeople().then((data) => {
      if (data && Array.isArray(data)) {
        setusers(
          data.map(
            (user: any): User => ({
              id: user.user_id,
              avatar: user.user_avatar_path,
              name: user.user_fname + " " + user.user_lname,
              birthday: new Date(user.user_dob),
            })
          )
        );
      }
    });
  }, []);

  return (
    users && (
      <div className="[&>*]:w-full w-[260px] h-[350px] flex flex-col gap-2 items-center justify-center bg-black rounded-lg px-4">
        <div className="w-full h-[10%] flex items-center justify-start font-bold text-white text-[1.5rem] py-6 mt-3">
          Birthdays
        </div>
        <div className="w-full h-[85%] overflow-y-scroll">
          {sortedUsers &&
            sortedUsers.map((user, index) => (
              <div
                key={index}
                className={`w-full h-30 py-4 flex flex-col justify-between text-white ${
                  index !== sortedUsers.length - 1
                    ? "border-b-[0.1px] border-b-[#ffffff3c]"
                    : ""
                } gap-3`}
              >
                <div className="w-full flex justify-between">
                  <div className="flex items-center justify-between gap-3">
                    <Avatar className="bg-gray-500">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-white bg-gray-500">
                        {user.name[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                    </div>
                  </div>
                  {isBirthdayToday(user.birthday) && (
                    <span className="bg-purple-600 text-white font-bold text-xs px-2 py-2 rounded-full h-fit">
                      🎉 Today
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  Born on {user.birthday.toLocaleDateString()}
                </div>
              </div>
            ))}
        </div>
      </div>
    )
  );
};

export default BirthdayList;
