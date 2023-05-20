import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  // beforeAuth(req, evt) {
  //   console.log('...', req)
  // },
  // ignoredRoutes(req) {
  //   const u = new URL(req.url);
  //   return u.pathname.startsWith("/invoice");
  // },
  publicRoutes: [
    '/invoice/:id/pdf',
    '/api/trpc/:id'
  ]
  // publicRoutes: (req) => {
  //   const u = new URL(req.url);
  //   console.log('>>>>>>>>>>>>>>>', req.url, "...", u.pathname);
  //   return (
  //     u.pathname.startsWith("/invoice") || u.pathname.startsWith("/api/trpc")
  //   );
  // },
});

// export const config = {

//   matcher: ["/(.*?trpc.*?|(?!static|.*\\..*|_next|favicon.ico).*)", "/"],
// };

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)", "/", "/(api|trpc)(.*)"],
  // matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

// export const config = {
//   matcher: [
//     // "/((?!.*\\..*|_next).*)", //
//     '/((?!api|api/trpc|_next/static|_next/image|favicon.ico).*)',
//     "/",
//     // "/(invoice|api|trpc)(.*)",
//   ],
// };
