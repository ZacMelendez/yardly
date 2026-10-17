import { NextResponse } from "next/server";

export async function GET() {
    const response = new NextResponse("Cookies cleared!");

    // Clear Better Auth cookies (default prefix: better-auth)
    response.cookies.delete("better-auth.session_token");
    response.cookies.delete("better-auth.session_data");
    response.cookies.delete("better-auth.dont_remember");

    return response;
}
