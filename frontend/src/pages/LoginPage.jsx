export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="card max-w-md w-full">
        <h2 className="section-title text-center">Login</h2>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="input-field"
          />
          <input
            type="password"
            placeholder="Password"
            className="input-field"
          />
          <button type="submit" className="btn-primary w-full">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
