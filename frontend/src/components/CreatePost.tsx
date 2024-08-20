import React, { ChangeEvent, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "./ui/textarea";
import { useForm } from "react-hook-form";
import {
  createPostSchema,
  HandleCreatePost,
} from "@/lib/schemas/createPostSchema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "./ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Images } from "lucide-react";

const CreatePost = () => {
  const [isDialogOpen, setisDialogOpen] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof createPostSchema>>({
    resolver: zodResolver(createPostSchema),
  });

  const onSubmit = async (values: z.infer<typeof createPostSchema>) => {
    try {
      await HandleCreatePost(values);

      setisDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error creating post",
        description: "our servers did not create the post properly",
      });
    }
  };

  const handleImageSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      form.setValue("imageContent", file);
    }
  };

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={() => setisDialogOpen(!isDialogOpen)}
    >
      <DialogTrigger onClick={() => setisDialogOpen(true)}>
        {" "}
        <div className="cursor-pointer w-[570px] bg-black h-fit flex items-center justify-start gap-4 py-2 px-4 rounded-lg">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <h1 className="text-[#ffffff66]">What's new?</h1>
        </div>
      </DialogTrigger>
      <DialogContent className="text-white bg-neutral-950 border-[#ffffff66] w-[870px] flex flex-col items-start justify-evenly">
        <div className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h4 className="text-white font-bold">Abdulrahman Idrees</h4>
            <h6 className="text-[#ffffff66]">Public Post</h6>
          </div>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-8"
          >
            <FormField
              control={form.control}
              name="textContent"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      className="bg-transparent border-0 h-16"
                      placeholder="What's on your mind?"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="imageContent"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="file"
                      id="post-image-input"
                      className="hidden"
                      onChange={handleImageSelection}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Images
              onClick={() =>
                document.getElementById("post-image-input")?.click()
              }
              className="cursor-pointer"
            />
            <div className="w-full flex items-center justify-end">
              <Button type="submit">Submit</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
