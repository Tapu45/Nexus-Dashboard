import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="flex justify-between items-center p-6 sm:p-8">
        <div className="flex items-center gap-2">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Nexus Logo"
            width={120}
            height={25}
            priority
          />
        </div>
        <Link
          href="/login"
          className="rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors px-6 py-2 font-medium text-sm"
        >
          Login
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex flex-col items-center justify-center px-8 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to{" "}
            <span className="text-indigo-600 dark:text-indigo-400">Nexus</span>
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Your powerful dashboard solution for managing and monitoring your applications with ease and efficiency.
          </p>

          <div className="flex gap-4 items-center justify-center flex-col sm:flex-row mb-16">
            <Link
              href="/login"
              className="rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 font-medium text-base h-12 px-8 w-full sm:w-auto"
            >
              Get Started
            </Link>
            <a
              className="rounded-full border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center font-medium text-base h-12 px-8 w-full sm:w-auto"
              href="#features"
            >
              Learn More
            </a>
          </div>

          {/* Features Section */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Image
                  src="/file.svg"
                  alt="Analytics icon"
                  width={24}
                  height={24}
                  className="dark:invert"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Get detailed insights and analytics about your applications and user behavior.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Image
                  src="/window.svg"
                  alt="Dashboard icon"
                  width={24}
                  height={24}
                  className="dark:invert"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Dashboard
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Intuitive dashboard interface to manage all your resources in one place.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Image
                  src="/globe.svg"
                  alt="Global icon"
                  width={24}
                  height={24}
                  className="dark:invert"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Global Access
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Access your dashboard from anywhere in the world with cloud synchronization.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="max-w-6xl mx-auto px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                className="dark:invert"
                src="/next.svg"
                alt="Nexus Logo"
                width={100}
                height={20}
              />
            </div>
            <div className="flex gap-6">
              <a
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                href="/privacy"
              >
                Privacy
              </a>
              <a
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                href="/terms"
              >
                Terms
              </a>
              <a
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                href="/contact"
              >
                Contact
              </a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-gray-500 dark:text-gray-400">
            © 2025 Nexus. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}