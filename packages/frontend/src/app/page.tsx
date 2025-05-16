import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Discover Local Events in Your City
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              PorchBoard helps cities and communities share and discover local events. From festivals to
              workshops, find everything happening in your area.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/events"
                className="rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Browse Events
              </Link>
              <Link href="/about" className="text-sm font-semibold leading-6 text-gray-900">
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 