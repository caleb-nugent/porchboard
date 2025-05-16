import { CalendarIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline'

const sampleEvents = [
  {
    id: 1,
    title: "Summer Music Festival 2024",
    description: "Join us for a weekend of amazing music, food, and fun!",
    date: "2024-07-15",
    time: "12:00 PM",
    location: "Central Park, New York",
    image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    attendees: 1200,
    price: "$150"
  },
  {
    id: 2,
    title: "Tech Conference 2024",
    description: "Annual technology conference featuring the latest innovations and networking opportunities.",
    date: "2024-08-20",
    time: "9:00 AM",
    location: "Convention Center, San Francisco",
    image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2012&q=80",
    attendees: 500,
    price: "$299"
  },
  {
    id: 3,
    title: "Food & Wine Festival",
    description: "Experience the finest cuisines and wines from around the world.",
    date: "2024-09-10",
    time: "11:00 AM",
    location: "Downtown District, Chicago",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    attendees: 800,
    price: "$75"
  },
  {
    id: 4,
    title: "Marathon 2024",
    description: "Annual city marathon with scenic routes and professional timing.",
    date: "2024-10-05",
    time: "7:00 AM",
    location: "City Center, Boston",
    image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
    attendees: 5000,
    price: "$85"
  }
]

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Upcoming Events</h1>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sampleEvents.map((event) => (
              <div key={event.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="relative h-48">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{event.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      <span>{event.date} at {event.time}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPinIcon className="h-5 w-5 mr-2" />
                      <span>{event.location}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <UserGroupIcon className="h-5 w-5 mr-2" />
                      <span>{event.attendees} attendees</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">{event.price}</span>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      Register
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
} 