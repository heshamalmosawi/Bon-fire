import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createEventSchema,
  handleCreateEvent,
} from "@/lib/schemas/createEventSchema";
import { useState, useEffect } from "react";
import { fetchSessionUser } from "@/lib/api";
import { useToast } from "./ui/use-toast";


export default function EventDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [groupId, setGroupId] = useState("");
  const [creatorId, setCreatorId] = useState("");
  const [minDate, setMinDate] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pathParts = window.location.pathname.split("/");
      const id = pathParts[pathParts.length - 1]; // Assuming the URL is like /groups/{id}
      setGroupId(id);
    }

    const authenticate = async () => {
      try {
        const data = await fetchSessionUser();
        if (data && data.status === 200) {
          setCreatorId(data.User.user_id);
        } else {
          window.location.href = "/auth"; // Redirect to auth
        }
      } catch (error) {
        console.error("Authentication failed:", error);
        window.location.href = "/auth"; // Redirect to auth on error
      }
    };

    authenticate();
    setMinDate(new Date().toISOString().split("T")[0]); // Set the minimum date to today's date
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription || !dateTime) {
      console.error("Invalid input: Fields cannot be empty.");
      return;
    }

    const eventDateTime = new Date(dateTime);
    const now = new Date();

    if (eventDateTime < now) {
      toast({
        variant: "destructive",
        title: "Error creating event",
        description: "Event date and time must be in the future.",
      });
      return;
    }

    try {
      const formData = createEventSchema.parse({
        eventTitle: trimmedTitle,
        eventDescription: trimmedDescription,
        eventTime: new Date(dateTime),
        groupId,
        creatorId,
      });

      await handleCreateEvent(formData);
      console.log("Event successfully added");
      setOpen(false);
      setTitle("");
      setDescription("");
      setDateTime("");
    } catch (error) {
      console.error("Error submitting event:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="bg-indigo-500 hover:bg-indigo-700"
        >
          Add New Event
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-black">
        <DialogHeader>
          <DialogTitle className="text-white">Add New Event</DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a new event for your group. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right text-gray-400">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3 bg-black text-white"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right text-gray-400">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3 bg-black text-white"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="datetime" className="text-right text-gray-400">
                Day/Time
              </Label>
              <Input
                id="datetime"
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="col-span-3 bg-black text-white"
                required
                min={minDate} // Setting the minimum date attribute to disable past dates
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              Save Event
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
