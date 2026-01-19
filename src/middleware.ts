export { default } from 'next-auth/middleware'

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/owner/:path*',
    '/admin/:path*',
    '/favorites/:path*',
  ],
}
