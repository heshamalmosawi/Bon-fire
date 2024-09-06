import { z } from "zod";
import axios from "axios";

export const createEventSchema = z.object({
  eventTitle: z.string().min(1, "Event title is required"),
  eventDescription: z.string().min(5, "Event description must be at least 5 characters"),
  eventTime: z.date(), 
  groupId: z.string().uuid("Invalid group ID format"),
  creatorId: z.string().uuid("Invalid group ID format")
});

export const handleCreateEvent = async (
    values: z.infer<typeof createEventSchema>
  ) => {
    try {
      const payload = {
        event_title: values.eventTitle,
        event_description: values.eventDescription,
        event_timestamp: values.eventTime.toISOString(),
        group_id: values.groupId,
        creator_id : values.creatorId,
      };
  
      const response = await axios.post('http://localhost:8080/addevent', payload, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status === 201) {
        console.log('Event successfully added');
        return response.data; // or any other handling as per your needs
      } else {
        throw new Error(`Failed to create event: ${response.status}`);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      throw error; // Rethrow to handle it further up the call stack
    }};