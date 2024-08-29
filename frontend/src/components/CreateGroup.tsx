import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { groupCreateSchema,HandleCreateGroup } from "@/lib/schemas/createGroupSchema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "./ui/use-toast";

interface GroupCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const GroupCreationDialog: React.FC<GroupCreationDialogProps> = ({ isOpen, onClose }) => {
  const form = useForm<z.infer<typeof groupCreateSchema>>({
    resolver: zodResolver(groupCreateSchema),
  });

  const {toast} = useToast();
  const onSubmit = async (values: z.infer<typeof groupCreateSchema>) => {
    try {
      const data = await HandleCreateGroup(values); // Call the handler
      console.log("Group created:", data);

      // Show success toast
      toast({
        title: "Success!",
        description: "Group created successfully.",
      });

      onClose(); // Close the dialog after successful creation
    } catch (error) {
      console.error("Failed to create group:", error);

      // Show error toast
      toast({
        title: "Error!",
        description: "Failed to create group.",
        variant: "destructive", // Use destructive variant for error messages
      });
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-black text-white"> {/* Dark background and white text */}
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription>Please enter the group details.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="groupName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input
                      id="groupName"
                      placeholder="Enter group name"
                      {...field}
                      className="mt-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md"  // Dark input field
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="groupDescrip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Description</FormLabel>
                  <FormControl>
                    <Input
                      id="groupDescrip"
                      placeholder="Enter group description"
                      {...field}
                      className="mt-2 w-full bg-gray-800 text-white border border-gray-700 rounded-md"  // Dark input field
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button variant="outline" className="bg-gray-700 text-white hover:bg-gray-600" onClick={onClose}>
                Cancel
              </Button>
              <Button className="ml-2 bg-blue-600 text-white hover:bg-blue-700" type="submit">
                Create
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default GroupCreationDialog;
