import { SignIn, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserPlus } from "lucide-react";

export default function Home() {
  return (
    <div className="grid lg:grid-cols-2 h-screen">
      <div className="fixed top-4 right-4">
        <Link href="/signup">
          <Button>
            <UserPlus className="mr-2" />
            Create an account
          </Button>
        </Link>
      </div>
      <div className="bg-muted hidden lg:block"></div>
      <div className="bg-background flex items-center justify-center">
        <SignIn/>
      </div>
    </div>
  );
}
