"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, UsersIcon, CheckIcon, XIcon } from "lucide-react"

interface Event {
  id: number
  title: string
  description: string
  date: Date
  attendees: number
}

const SAMPLE_EVENTS: Event[] = [
  {
    id: 1,
    title: "Summer Picnic",
    description: "Join us for a fun day out in the park with games and food!",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    attendees: 15,
  },
  {
    id: 2,
    title: "Tech Meetup",
    description: "Discuss the latest trends in web development and networking.",
    date: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    attendees: 30,
  },
  {
    id: 3,
    title: "Movie Night",
    description: "Watch the latest blockbuster with fellow movie enthusiasts.",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    attendees: 20,
  },
]

export default function Events() {
  const [events, setEvents] = useState<Event[]>(SAMPLE_EVENTS)

  const getEventStatus = (eventDate: Date) => {
    const now = new Date()
    const timeDiff = eventDate.getTime() - now.getTime()
    const hoursDiff = timeDiff / (1000 * 60 * 60)

    if (hoursDiff > 0) {
      const days = Math.floor(hoursDiff / 24)
      const hours = Math.floor(hoursDiff % 24)
      return `${days}d ${hours}h remaining`
    } else if (hoursDiff > -2) {
      return "Ongoing"
    } else {
      return "Finished"
    }
  }

  const handleRSVP = (eventId: number, going: boolean) => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, attendees: going ? event.attendees + 1 : Math.max(0, event.attendees - 1) }
        : event
    ))
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Upcoming Events</h1>
      {events.map((event) => (
        <Card key={event.id}>
          <CardHeader>
            <CardTitle>{event.title}</CardTitle>
            <CardDescription>{event.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <time dateTime={event.date.toISOString()}>
                {event.date.toLocaleDateString()} at {event.date.toLocaleTimeString()}
              </time>
            </div>
            <div className="flex items-center space-x-2 mt-2 text-sm text-muted-foreground">
              <UsersIcon className="h-4 w-4" />
              <span>{event.attendees} attending</span>
            </div>
            <Badge 
  variant={getEventStatus(event.date).includes("remaining") ? "secondary" : 
          getEventStatus(event.date) === "Ongoing" ? "default" : "outline"}
  className="mt-2 bg-white text-black border border-gray-300" // Added classes for white background and black text
>
  {getEventStatus(event.date)}
</Badge>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleRSVP(event.id, true)}
            >
              <CheckIcon className="mr-2 h-4 w-4" /> Going
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleRSVP(event.id, false)}
            >
              <XIcon className="mr-2 h-4 w-4" /> Not Going
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}