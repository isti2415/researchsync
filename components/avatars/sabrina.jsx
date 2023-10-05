import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Sabrina() {
  return (
    <Avatar>
      <AvatarImage src="/sabrina.jpg"/>
      <AvatarFallback>SM</AvatarFallback>
    </Avatar>
  );
}
