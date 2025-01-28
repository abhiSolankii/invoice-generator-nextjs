import Link from "next/link";

const Navbar = () => {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Invoice Generator
        </Link>
        <ul className="flex space-x-4">
          <li>
            <Link href="/my-invoices" className="hover:text-gray-200">
              My Invoices
            </Link>
          </li>
          <li>
            <Link href="/settings" className="hover:text-gray-200">
              Settings
            </Link>
          </li>
          {/* Add more nav items as needed */}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
