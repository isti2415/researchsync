import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { UserCheck, UserPlus } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { isSignedIn } = useUser();

  const renderButtons = () => {
    if (isSignedIn !== undefined) {
      return (
        <div className="flex gap-4 items-center">
          {isSignedIn ? (
            <Link href="/dashboard">
              <Button>Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/signup">
                <Button>
                  <UserPlus className="mr-2" />
                  Create an account
                </Button>
              </Link>
              <Link href="/login">
                <Button>
                  <UserCheck className="mr-2" />
                  Log in
                </Button>
              </Link>
            </>
          )}
        </div>
      );
    }
    // Return null or an empty fragment if isSignedIn is still undefined
    return null;
  };

  return (
    <div className="grid grid-cols-2 h-screen">
      <div className="bg-muted hidden lg:block"></div>
      <div className="bg-background">
        <div className="fixed top-4 right-4">{renderButtons()}</div>
      </div>
    </div>
  );
}
