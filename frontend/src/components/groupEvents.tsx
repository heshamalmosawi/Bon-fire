import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, UsersIcon, CheckIcon, XIcon } from "lucide-react";
import { fetchEventsByGroup } from "@/lib/api"; // Ensure this function is implemented correctly in your API module

interface Event {
  event_id: string;
  event_title: string;
  event_description: string;
  event_timestamp: Date;
  attendees: number;
}

export default function Events({ groupId }: { groupId: string }) {
  const [events, setEvents] = useState<Event[]>([]);
  useEffect(() => {
    const loadEvents = async () => {
      const fetchedEvents = await fetchEventsByGroup(groupId);
      if (fetchedEvents) {
        setEvents(fetchedEvents.map(event => ({
          ...event,
          event_timestamp: new Date(event.event_timestamp), // Assuming the key should be `date` based on your Event interface
          attendees: 10 // Hardcode the number of attendees
        })));
      } else {
        // Handle the case where no events are fetched or an error occurred
        setEvents([]); // Set to empty array or handle differently
        console.error('Failed to fetch events, or no events exist for this group.');
      }
    };
    loadEvents();
  }, [groupId]);
  

  const getEventStatus = (eventDate: Date) => {
    const now = new Date();
    const timeDiff = eventDate.getTime() - now.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    if (hoursDiff > 0) {
      return `${Math.floor(hoursDiff / 24)}d ${Math.floor(hoursDiff % 24)}h remaining`;
    } else if (hoursDiff > -2) {
      return "Ongoing";
    } else {
      return "Finished";
    }
  };

  const handleRSVP = (eventId: string, going: boolean) => {
    setEvents(events.map(event =>
      event.event_id === eventId
        ? { ...event, attendees: going ? event.attendees + 1 : Math.max(0, event.attendees - 1) }
        : event
    ));
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Upcoming Events</h1>
      {events.map((event) => (
        <Card key={event.event_id}>
          <CardHeader>
            <CardTitle>{event.event_title}</CardTitle>
            <CardDescription>{event.event_description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <time dateTime={event.event_timestamp.toISOString()}>
                {event.event_timestamp.toLocaleDateString()} at {event.event_timestamp.toLocaleTimeString()}
              </time>
            </div>
            <div className="flex items-center space-x-2 mt-2 text-sm text-muted-foreground">
              <UsersIcon className="h-4 w-4" />
              <span>{event.attendees} attending</span>
            </div>
            <Badge
              variant={getEventStatus(event.event_timestamp).includes("remaining") ? "secondary" :
                getEventStatus(event.event_timestamp) === "Ongoing" ? "default" : "outline"}
              className="mt-2 bg-white text-black border border-gray-300"
            >
              {getEventStatus(event.event_timestamp)}
            </Badge>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRSVP(event.event_id, true)}
            >
              <CheckIcon className="mr-2 h-4 w-4" /> Going
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRSVP(event.event_id, false)}
            >
              <XIcon className="mr-2 h-4 w-4" /> Not Going
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
