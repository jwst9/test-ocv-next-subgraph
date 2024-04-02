"use client";

import React from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  Form,
  FormMessage,
  FormDescription,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const Signin: React.FC = () => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const router = useRouter();

  const { mutate, isPending, data } = useMutation({
    mutationFn: ({ email, password }: z.infer<typeof schema>) =>
      signIn("user-credential", {
        redirect: false,
        email,
        password,
      }).then((res) => res?.ok && router.push("/")),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => form.handleSubmit((data) => mutate(data))(e)}
        className="mx-auto my-8 max-w-xs space-y-8"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email" {...field} autoFocus />
              </FormControl>
              {form.formState.errors.email && (
                <FormDescription>
                  {form.formState.errors.email.message}
                </FormDescription>
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="password" {...field} />
              </FormControl>
              {form.formState.errors.password && (
                <FormDescription>
                  {form.formState.errors.password.message}
                </FormDescription>
              )}
            </FormItem>
          )}
        />
        <div className="text-center">
          <Button disabled={isPending} type="submit">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign in
          </Button>
        </div>
        {data === false && (
          <FormMessage>
            Invalid credential. Please check email and password.
          </FormMessage>
        )}
      </form>
      <p className="text-center">
        I don&apos;t have account.{" "}
        <Link href="/signup" className="hover:underline">
          Go to register page
        </Link>
      </p>
    </Form>
  );
};

export default Signin;
