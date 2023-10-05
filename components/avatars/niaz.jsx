import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Niaz() {
  return (
    <Avatar>
      <AvatarImage src="/niaz.jpg"/>
      <AvatarFallback>SNM</AvatarFallback>
    </Avatar>
  );
}
