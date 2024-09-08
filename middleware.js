import { NextResponse } from 'next/server';

export async function middleware(request) {
    const token = request?.cookies['_parsed']?.get('token')?.value;
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
        const res = await fetch('http://localhost:3000/api/auth/protected', {
            headers: {
                Authorization: token,
            },
        });
        if (!res.ok) {
            throw new Error('Token validation failed');
        }
        return NextResponse.next();
    } catch (error) {
        console.error(error);
        return NextResponse.redirect(new URL('/login', request.url));
    }
}

export const config = {
    matcher: ['/report/:path*', '/dashboard/:path*', '/getdata/:path*', '/update/:path*', '/worklist/:path*'],
};