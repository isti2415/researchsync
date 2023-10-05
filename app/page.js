"use client";

import Biru from "@/components/avatars/biru";
import FahadSir from "@/components/avatars/fahad-sir";
import Istiaq from "@/components/avatars/istiaq";
import Niaz from "@/components/avatars/niaz";
import Sabrina from "@/components/avatars/sabrina";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Toaster, toast } from "sonner";

export default function Home() {

  const Router = useRouter();
  const [password, setPassword] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);

  const options = [
    { value: "fahad", label: "Md. Fahad Monir", avatar: <FahadSir /> },
    { value: "biru", label: "Biru Mondal", avatar: <Biru /> },
    { value: "istiaq", label: "Istiaq Ahmed", avatar: <Istiaq /> },
    { value: "niaz", label: "Syed Niaz Mohtasim", avatar: <Niaz /> },
    { value: "sabrina", label: "Sabrina Masum", avatar: <Sabrina /> },
  ];

  const handleRadioChange = (value) => {
    setSelectedValue(value);
  };

  const handlePassword = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the default form submission behavior

    if (password === selectedValue) {
      console.log("Login success");
      Cookies.set("user", selectedValue);
      Router.push("/dashboard");
    } else {
      console.log("Login failed");
      setPassword("");
      toast.error("Wrong Password");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <ModeToggle />
      <Toaster closeButton position="top-right" richColors/>
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-center mb-4">
        Research Sync
      </h1>
      <Card className="mt-4 lg:w-1/5">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="scroll-m-20 text-2xl font-semibold tracking-tight">
              Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Label>Select Account</Label>
              <RadioGroup value={selectedValue} onValueChange={handleRadioChange}>
                {options.map((option) => (
                  <div className="flex items-center space-x-4">
                  <RadioGroupItem value={option.value} id={option.value} />
                    {option.avatar}
                  <Label htmlFor={option.value}>{option.label}</Label>
                </div>
                ))}
              </RadioGroup>
              <div className="grid w-full max-w-sm items-center gap-4 mt-4">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={handlePassword}
                />
              </div>
              <div className="flex justify-end mt-4">
                <Button type="submit">Sign In</Button>{" "}
              </div>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
