import React, { FC } from "react";
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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { HandleLoginSubmission, loginSchema } from "@/lib/schemas/loginSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";

const AuthDesktop: FC = () => {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const { toast } = useToast();
  const router = useRouter();

  //* we wrap submission handlers around this for UI friendly errors, and redirection handling
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      await HandleLoginSubmission(values);

      router.push("/"); // redirect to / after login
    } catch (error) {
      toast({
        title: "Error!",
        description: "check the logs for more",
        variant: "destructive",
      });
    }
  };

  return (
    <main className="w-screen h-screen flex items-center justify-center bg-neutral-950">
      <div className="w-[60%] h-full bg-bonfire bg-cover rounded-r-3xl">
        <div className="w-full h-full flex items-center justify-center rounded-r-3xl"></div>
      </div>
      <div className="w-[40%] h-full flex flex-col items-center justify-center gap-7">
        <h1 className="text-white text-[4rem] w-[80%] text-left">Bonfire</h1>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 w-[80%]"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email</FormLabel>
                  <FormControl>
                    <Input
                      className="w-full bg-neutral-900 text-white border-0"
                      placeholder="noobmaster69@gmail.com"
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
                      className="w-full bg-neutral-900 text-white border-0"
                      type="password"
                      placeholder="**********"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="w-full bg-blue-400 hover:bg-blue-800"
              type="submit"
            >
              Login
            </Button>
          </form>
          <Button className="text-white" variant={"link"}>
            No Account?
          </Button>
        </Form>
      </div>
    </main>
  );
};

export default AuthDesktop;
