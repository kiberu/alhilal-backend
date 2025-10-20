// Dashboard home page
export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p className="mt-2 text-gray-600">
        Welcome to the Alhilal Admin Dashboard
      </p>
      
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Trips</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">12</p>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-medium text-gray-600">Active Bookings</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">284</p>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-medium text-gray-600">Total Pilgrims</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">1,247</p>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-sm font-medium text-gray-600">Pending Visas</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">43</p>
        </div>
      </div>
    </div>
  )
}

