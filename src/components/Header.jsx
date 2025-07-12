import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  return (
    <header className="bg-black text-white p-4 shadow-lg">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/next.svg" alt="Movie Mania Logo" width={30} height={30} />
          <span className="text-2xl font-bold text-red-600">MovieMania</span>
        </Link>
        <ul className="flex space-x-6">
          <li>
            <Link href="/" className="hover:text-red-600 transition duration-300">Home</Link>
          </li>
          <li>
            <Link href="/dashboard" className="hover:text-red-600 transition duration-300">Dashboard</Link>
          </li>
          <li>
            <Link href="/search" className="hover:text-red-600 transition duration-300">Search</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
