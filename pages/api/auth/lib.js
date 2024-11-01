import { jwtVerify, SignJWT } from "jose";
import Cookies from "js-cookie";
import { NextResponse } from "next/server";

const secretKey = process.env.JWT_SECRET
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("10 min from now")
        .sign(key);
}

export async function decrypt(input, context) {
    if (!input) {
        return null;
    }
    try {
        const { payload } = await jwtVerify(input, key, {
            algorithms: ["HS256"],
        });
        return payload;
    } catch (e) {
        console.log("Something went wrong while fetching Payload", e);
        return null;
    }
}

export async function getSession() {
    const session = Cookies.get('session');
    if (!session) return null;
    return await decrypt(session);
}

export async function logout() {
    Cookies.remove('session');
}

export async function isLoggedIn() {
    const session = await getSession();
    if (!session) return false;
    return true;
}

export async function updateSession(cookies) {
    const session = cookies;
    if (!session) return null;
    const parsed = await decrypt(session);
    parsed.expires = new Date(Date.now() + 10 * 1000);
    const res = NextResponse.next();
    res.cookies.set({
        name: 'session',
        value: await encrypt(parsed),
        expires: parsed.expires,
        httpOnly: true,
    })
    return res;
}