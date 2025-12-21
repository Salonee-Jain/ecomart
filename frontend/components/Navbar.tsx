"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
    const { user, loading } = useAuth();

    return (
        <nav className="border-b p-4 flex justify-between">
            <Link href="/" className="font-bold text-green-600">
                EcoMart
            </Link>

            {!loading && (
                <div className="space-x-4">
                    <Link href="/cart">Cart</Link>

                    {user ? (
                        <>
                            <Link href="/orders">Orders</Link>
                            {user.isAdmin && <Link href="/admin/products">Admin</Link>}
                            <button
                                className="ml-4 text-red-600"
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    window.location.href = "/login";
                                }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">Login</Link>
                            <Link href="/register">Register</Link>
                            <button
                                onClick={() => {
                                    localStorage.removeItem("token");
                                    window.location.href = "/login";
                                }}
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}
