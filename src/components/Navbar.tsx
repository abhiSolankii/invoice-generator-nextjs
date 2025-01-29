"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold">InvoiceGen</span>
            </Link>

            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/invoices"
                  className={`inline-flex items-center px-1 pt-1 ${
                    pathname === "/invoices"
                      ? "border-b-2 border-indigo-500 text-gray-900"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  My Invoices
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">{user.name}</span>
                <button
                  onClick={() => {
                    // Handle logout
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link
                  href="/login"
                  className="text-gray-500 hover:text-gray-700"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                >
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
