"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { FileText, LogOut, User } from "lucide-react";

export default function Navbar() {
  const { user, token, logOut } = useAuth();
  // console.log(user, token);
  const pathname = usePathname();

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-gray-900">
                InvoiceGen
              </span>
            </Link>

            {user && (
              <div className="hidden sm:flex sm:gap-6">
                <Link
                  href="/invoices"
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors ${
                    pathname === "/invoices"
                      ? "border-b-2 border-primary text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  My Invoices
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={() => {
                    logOut();
                  }}
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Login
                </Link>
                <Link href="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
