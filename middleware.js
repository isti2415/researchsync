import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

// Protects only "/" and any page inside "/auth"
export default authMiddleware({
  publicRoutes: ["/", "/signup", "/login"],
  afterAuth(auth, req, evt) {

    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    if(auth.userId && !auth.orgId && req.nextUrl.pathname !== "/projects"){
      const orgSelection = new URL(`/projects`, req.url)
      return NextResponse.redirect(orgSelection)
    }

    if(auth.userId && auth.orgId && !req.nextUrl.pathname.startsWith(`/projects/${auth.orgSlug}`)){
      const orgSelection = new URL(`/projects/${auth.orgSlug}`, req.url)
      return NextResponse.redirect(orgSelection)
    }

    return NextResponse.next();
  },
});

export const config = {
  // Your existing matcher configuration
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
