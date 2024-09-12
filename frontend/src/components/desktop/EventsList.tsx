"use client";

import { getEventsIndex } from "@/lib/api";
import { BonfireEvent } from "@/lib/interfaces";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useToast } from "../ui/use-toast";

const EventsList = () => {
  const [events, setevents] = useState<BonfireEvent[] | undefined>();
  const router = useRouter();
  const { toast } = useToast();

  const isEventLive = (event: BonfireEvent) => {
    const now = Date.now();
    const eventEnd = event.eventDate.getTime() + event.eventDuration;
    return now >= event.eventDate.getTime() && now <= eventEnd;
  };

  useEffect(() => {
    getEventsIndex().then((data) => {
      if (data) {
        setevents(data);
      } else {
        toast({
          variant: "destructive",
          title: "Error fetching events",
          description: "there was a error fetching current events for you",
        });
      }
    });
  }, []);

  return (
    <div className="[&>*]:w-full w-[260px] h-[350px] flex flex-col gap-2 items-center justify-center bg-black rounded-lg px-4">
      <div className="w-full h-[10%] flex items-center justify-start font-bold  text-white text-[1.5rem] py-6 mt-3">
        Events
      </div>
      <div className="w-full h-[85%] overflow-y-scroll">
        {events && events.length ? (
          events
            .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())
            .map((event, index) => (
              <div
                key={index}
                className={`cursor-pointer w-full p-4 flex flex-col justify-between text-white ${
                  index !== events.length - 1
                    ? "border-b-[0.1px] border-b-[#ffffff3c]"
                    : ""
                }`}
                onClick={() => router.push(`/groups/${event.groupID}`)}
              >
                <div className="flex justify-between">
                  <span className="font-semibold">{event.eventTitle}</span>
                  {isEventLive(event) && (
                    <span className="bg-red-600 text-white font-bold text-xs px-2 py-1 rounded-full">
                      Live
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  {event.eventDate.toLocaleString()}
                </div>
              </div>
            ))
        ) : (
          <div className="text-white w-full h-[70%] flex items-center justify-center font-semibold">No events for you :(</div>
        )}
      </div>
    </div>
  );
};

export default EventsList;
