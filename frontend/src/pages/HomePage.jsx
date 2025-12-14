export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-900 mb-4">
            Welcome to Move-it
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Your Virtual Realtor - Save thousands with 2% transaction fees
          </p>
          <div className="flex justify-center gap-4">
            <a href="/login" className="btn-primary">
              Login
            </a>
            <a href="/register" className="btn-secondary">
              Register
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
