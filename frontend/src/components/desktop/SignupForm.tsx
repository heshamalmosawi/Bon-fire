import React, { FC, useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { signupSchema, HandleSignupSubmission } from "@/lib/schemas/signupSchema";
import { useToast } from "../ui/use-toast";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Textarea } from "../ui/textarea";

const SignupForm: FC = () => {
  const { toast } = useToast();
  const [stage, setStage] = useState(1);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    console.log("Submitting form with values:", values);
    try {
      await HandleSignupSubmission(values);
      toast({
        title: "Success!",
        description: "Signup successful!",
      });
    } catch (error) {
      console.error("Signup submission failed:", error);
      toast({
        title: "Error!",
        description: "Check the logs for more",
        variant: "destructive",
      });
    }
  };

  const nextStage = () => {
    console.log("Proceeding to next stage");
    setStage(2);
  };

  const prevStage = () => {
    console.log("Going back to previous stage");
    setStage(1);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      form.setValue("avatar", file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <main className="w-screen h-screen flex items-center justify-center bg-neutral-950">
      <div className="w-[50%] h-full flex flex-col items-center justify-center gap-7">
        {stage === 1 && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 w-full mx-auto"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="dark">
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input
                        className="dark text-white"
                        type="email"
                        placeholder="john.doe@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="dark">
                    <FormLabel className="text-white">Password</FormLabel>
                    <FormControl>
                      <Input
                        className="text-white"
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="dark">
                    <FormLabel className="text-white">
                      Confirm Password
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="text-white"
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                className="w-full bg-blue-400 hover:bg-blue-800 rounded-md"
                type="button"
                onClick={nextStage}
              >
                Next
              </Button>
            </form>
          </Form>
        )}
        {stage === 2 && (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 w-full mx-auto"
            >
              <FormItem className="dark">
                <FormLabel className="text-white">Avatar</FormLabel>
                <FormControl>
                  <div className="flex flex-col items-center justify-center gap-4">
                    {avatarPreview && (
                      <img
                        src={avatarPreview}
                        alt="Avatar Preview"
                        className="mt-4 w-20 h-20 rounded-full mx-auto"
                      />
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="w-full text-white file:text-white"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem className="dark">
                    <FormLabel className="text-white">First Name</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full text-white"
                        placeholder="John"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem className="dark">
                    <FormLabel className="text-white">Last Name</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full text-white"
                        placeholder="Doe"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem className="dark flex flex-col text-white">
                    <FormLabel>Date of birth</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="dark w-auto p-0 border-4"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          className="bg-neutral-950 text-white"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem className="dark">
                    <FormLabel className="text-white">
                      Nickname (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="w-full text-white"
                        placeholder="Nickname"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                  <FormItem className="dark">
                    <FormLabel className="text-white">Bio (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        className="w-full text-white"
                        placeholder="Tell us about yourself..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <Button
                  className="bg-gray-600 text-white rounded-md py-2 hover:bg-gray-800"
                  type="button"
                  onClick={prevStage}
                >
                  Back
                </Button>
                <Button
                  className="bg-blue-400 text-white rounded-md py-2 hover:bg-blue-800"
                  type="submit"
                >
                  Complete Sign Up
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </main>
  );
};

export default SignupForm;
