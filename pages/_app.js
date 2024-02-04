import { ThemeProvider } from "next-themes";
import { ModeToggle } from "@/components/theme-toggle-btn";
import "@/styles/globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import Head from "next/head";
import { ClerkProviderWithTheme } from "@/components/clerkProviderWithTheme";

export default function App({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <ClerkProviderWithTheme>
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          <title>ResearchSync</title>
        </Head>
        <div className="fixed bottom-4 left-4 z-20">
          <ModeToggle />
        </div>
        <Component
          className={cn("min-h-screen bg-background antialiased")}
          {...pageProps}
        />
        <Toaster />
      </ClerkProviderWithTheme>
    </ThemeProvider>
  );
}
