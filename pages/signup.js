import { SignUp, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { UserCheck, UserPlus } from "lucide-react";
import Link from "next/link";

export default function Home() {

  return (
    <div className="grid grid-cols-2 h-screen">
      <div className="bg-muted hidden lg:block"></div>
      <div className="bg-background flex items-center justify-center">
        <div className="fixed top-4 right-4">
          <Link href="/login">
            <Button>
              <UserCheck className="mr-2" />
              Log in
            </Button>
          </Link>
        </div>
        <SignUp/>
      </div>
    </div>
  );
}
