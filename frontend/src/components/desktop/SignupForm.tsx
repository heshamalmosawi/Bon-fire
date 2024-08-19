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
              className="space-y-6 w-[80%] mx-auto"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Email</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full bg-neutral-900 text-white border-0 rounded-md"
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
                  <FormItem>
                    <FormLabel className="text-white">Password</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full bg-neutral-900 text-white border-0 rounded-md"
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
                  <FormItem>
                    <FormLabel className="text-white">Confirm Password</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full bg-neutral-900 text-white border-0 rounded-md"
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
              className="space-y-6 w-[80%] mx-auto"
            >
              <FormItem>
                <FormLabel className="text-white">Avatar</FormLabel>
                <FormControl>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="w-full bg-neutral-900 text-white border-0 rounded-md file:btn file:btn-bordered file:btn-accent"
                    />
                    {avatarPreview && (
                      <img
                        src={avatarPreview}
                        alt="Avatar Preview"
                        className="mt-4 w-24 h-24 rounded-full mx-auto"
                      />
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">First Name</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full bg-neutral-900 text-white border-0 rounded-md"
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
                  <FormItem>
                    <FormLabel className="text-white">Last Name</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full bg-neutral-900 text-white border-0 rounded-md"
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
                  <FormItem>
                    <FormLabel className="text-white">Date of Birth</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full bg-neutral-900 text-white border-0 rounded-md"
                        type="date"
                        value={field.value instanceof Date ? field.value.toISOString().substring(0, 10) : field.value || ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        ref={field.ref}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white">Nickname (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full bg-neutral-900 text-white border-0 rounded-md"
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
                  <FormItem>
                    <FormLabel className="text-white">About Me (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        className="w-full bg-neutral-900 text-white border-0 rounded-md"
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
