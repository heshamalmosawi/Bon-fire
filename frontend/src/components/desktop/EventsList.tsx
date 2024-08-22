import React from "react";

interface Events {
  EventName: string;
  EventDate: Date;
  EventDuration: number;
}

const sampleEvents: Events[] = [
  {
    EventName: "React Conference",
    EventDate: new Date(),
    EventDuration: 3600000,
  },
  {
    EventName: "JavaScript Meetup",
    EventDate: new Date(Date.now() - 7200000),
    EventDuration: 5400000,
  },
  {
    EventName: "CSS Workshop",
    EventDate: new Date(Date.now() + 1800000),
    EventDuration: 3600000,
  },
  {
    EventName: "Golang Workshop",
    EventDate: new Date(Date.now() + 1800000),
    EventDuration: 3600000,
  },
];

const EventsList = () => {
  const isEventLive = (event: Events) => {
    const now = Date.now();
    const eventEnd = event.EventDate.getTime() + event.EventDuration;
    return now >= event.EventDate.getTime() && now <= eventEnd;
  };

  return (
    <div className="[&>*]:w-full w-[260px] h-[400px] flex flex-col gap-2 items-center justify-center bg-black rounded-lg px-4">
      <div className="w-full h-[10%] flex items-center justify-start font-bold  text-white text-[1.5rem] py-6">
        Events
      </div>
      <div className="w-full h-[85%] overflow-y-scroll">
        {sampleEvents.map((event, index) => (
          <div
            key={index}
            className={`w-full p-4 flex flex-col justify-between text-white ${
              index !== sampleEvents.length - 1
                ? "border-b-[0.1px] border-b-[#ffffff3c]"
                : ""
            }`}
          >
            <div className="flex justify-between">
              <span className="font-semibold">{event.EventName}</span>
              {isEventLive(event) && (
                <span className="bg-red-600 text-white font-bold text-xs px-2 py-1 rounded-full">
                  Live
                </span>
              )}
            </div>
            <div className="text-sm text-gray-400">
              {event.EventDate.toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">
              Duration: {event.EventDuration / 60000} minutes
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventsList;
