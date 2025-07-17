"use client"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Mail, Lock, LogIn } from "lucide-react"
import { getTrendingMovies } from "@/lib/tmdb"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [backdrop, setBackdrop] = useState("https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/f562aaf4-5dbb-4603-a32b-6ef6c2230136/dh0w8qv-9d8ee6b2-b41a-4681-ab9b-8a227560dc75.jpg/v1/fill/w_1192,h_670,q_70,strp/the_netflix_login_background__canada__2024___by_logofeveryt_dh0w8qv-pre.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9NzIwIiwicGF0aCI6IlwvZlwvZjU2MmFhZjQtNWRiYi00NjAzLWEzMmItNmVmNmMyMjMwMTM2XC9kaDB3OHF2LTlkOGVlNmIyLWI0MWEtNDY4MS1hYjliLThhMjI3NTYwZGM3NS5qcGciLCJ3aWR0aCI6Ijw9MTI4MCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.LOYKSxIDqfPwWHR0SSJ-ugGQ6bECF0yO6Cmc0F26CQs")
   
  useEffect(() => {
    getTrendingMovies().then((data) => {
      setBackdrop(data[0].backdropPath)
    }).catch((err) => {
      console.error("Error fetching trending movies:", err);
    })
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      console.log("Login response:", res);

      if (res?.error) {
        setError(res.error);
      } else if (res?.ok) {
        router.push("/dashboard");
      } else {
        setError("Login failed. Please try again.");
      }
    } catch (error) {
      setError("Unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative bg-cover bg-center"
      style={{ backgroundImage: `url(${backdrop})` }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xs"></div>

      <div className="relative z-10 w-full max-w-md bg-gray-900/70 rounded-2xl border border-gray-800 shadow-lg p-6 sm:p-8">
        <div className="text-center mb-8">
          <Link href="/" className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded flex items-center justify-center font-bold text-lg sm:text-2xl">
              M
            </div>
            <span className="text-2xl sm:text-3xl font-bold text-red-600">Movie Mania</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Admin Login</h1>
          <p className="text-gray-400 text-sm sm:text-base">Access your Movie Mania Dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-center justify-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400 text-base"
              />
            </div>
          </div>
          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent text-white placeholder-gray-400 text-base"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Logging in...
              </div>
            ) : (
              <>
                <LogIn className="h-5 w-5 mr-2" />
                Login
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
