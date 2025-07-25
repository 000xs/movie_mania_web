import Link from "next/link";
import React from "react";


function Footer() {
  return (
    <footer className="bg-gray-900 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* <div className="max-w-7xl mx-auto"> */}
        {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
           
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
              Support
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
              <li>
                <Link
                  href="/help"
                  className="hover:text-white transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-white transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/feedback"
                  className="hover:text-white transition-colors"
                >
                  Feedback
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
              Legal
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-white transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/cookies"
                  className="hover:text-white transition-colors"
                >
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">
              Connect
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Facebook
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Twitter
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Instagram
                </Link>
              </li>
            </ul>
          </div>
        </div> */}
        <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-400">
          <p>&copy; 2025 Movie Mania. All rights reserved.</p>
        </div>
      {/* </div> */}
    </footer>
  );
}

export default Footer;
