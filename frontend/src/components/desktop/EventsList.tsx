"use client";

import React from "react";

interface Events {
  eventName: string;
  eventDate: Date;
  eventDuration: number;
}

const sampleEvents: Events[] = [
  {
    eventName: "React Conference",
    eventDate: new Date("2024-08-26T10:00:00Z"), // Static date
    eventDuration: 3600000,
  },
  {
    eventName: "JavaScript Meetup",
    eventDate: new Date("2024-08-26T08:00:00Z"),
    eventDuration: 5400000,
  },
  {
    eventName: "CSS Workshop",
    eventDate: new Date("2024-08-26T12:00:00Z"),
    eventDuration: 3600000,
  },
  {
    eventName: "Golang Workshop",
    eventDate: new Date("2024-08-26T14:00:00Z"),
    eventDuration: 3600000,
  },
];

const EventsList = () => {
  const isEventLive = (event: Events) => {
    const now = Date.now();
    const eventEnd = event.eventDate.getTime() + event.eventDuration;
    return now >= event.eventDate.getTime() && now <= eventEnd;
  };

  return (
    <div className="[&>*]:w-full w-[260px] h-[350px] flex flex-col gap-2 items-center justify-center bg-black rounded-lg px-4">
      <div className="w-full h-[10%] flex items-center justify-start font-bold  text-white text-[1.5rem] py-6 mt-3">
        Events
      </div>
      <div className="w-full h-[85%] overflow-y-scroll">
        {sampleEvents
          .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())
          .map((event, index) => (
            <div
              key={index}
              className={`w-full p-4 flex flex-col justify-between text-white ${
                index !== sampleEvents.length - 1
                  ? "border-b-[0.1px] border-b-[#ffffff3c]"
                  : ""
              }`}
            >
              <div className="flex justify-between">
                <span className="font-semibold">{event.eventName}</span>
                {isEventLive(event) && (
                  <span className="bg-red-600 text-white font-bold text-xs px-2 py-1 rounded-full">
                    Live
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-400">
                {event.eventDate.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">
                Duration: {event.eventDuration / 60000} minutes
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default EventsList;
