import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Biru() {
  return (
    <Avatar>
      <AvatarImage src="/biru.jpg"/>
      <AvatarFallback>BM</AvatarFallback>
    </Avatar>
  );
}
