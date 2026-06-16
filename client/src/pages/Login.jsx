import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 w-full max-w-md text-center shadow-xl">
        <h1 className="text-3xl font-bold text-white">TIPINC Dev Portal</h1>
        <p className="text-gray-400 mt-2 mb-8">Sign in with your TIPINC Microsoft account</p>
        <button
          onClick={login}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center gap-3"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
            <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
          </svg>
          Sign in with Microsoft
        </button>
        <p className="text-gray-600 text-xs mt-6">TIPINC Internal Only — Unauthorized access prohibited</p>
      </div>
    </div>
  )
}