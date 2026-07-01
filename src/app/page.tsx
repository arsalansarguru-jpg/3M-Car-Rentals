
export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-secondary">
      {/* Premium Navigation Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-bg-header border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-wider text-white">
            3M <span className="text-accent-gold">CAR RENTALS</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <a href="#fleet" className="hover:text-accent-gold transition-colors">Our Fleet</a>
          <a href="#airports" className="hover:text-accent-gold transition-colors">Airport Rentals</a>
          <a href="#about" className="hover:text-accent-gold transition-colors">About Us</a>
          <a href="#contact" className="hover:text-accent-gold transition-colors">Contact</a>
        </nav>
        <button className="px-5 py-2 text-sm font-semibold rounded-button bg-accent-gold text-primary-900 hover:bg-[#c89b2c] transition-all">
          Book Now
        </button>
      </header>

      {/* Hero Splash Showroom */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-primary-900 to-primary-700 text-white">
        <div className="max-w-3xl flex flex-col items-center gap-6">
          <span className="text-overline text-accent-gold tracking-widest bg-primary-700/50 px-3 py-1 rounded-badge">
            Premium Mobility Concierge in Goa
          </span>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Elevate Your Journey with <span className="text-accent-gold">Uncompromising Luxury</span>
          </h1>
          <p className="max-w-xl text-large-body text-gray-300">
            Self-drive luxury rentals, airport delivery promises, and personalized concierge-level experiences tailored for premium travelers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button className="h-12 px-8 rounded-button bg-accent-gold text-primary-900 font-semibold hover:bg-[#c89b2c] transition-all">
              Find Your Perfect Car
            </button>
            <button className="h-12 px-8 rounded-button border border-solid border-gray-300/40 text-white font-semibold hover:bg-white/10 transition-all">
              Explore Our Fleet
            </button>
          </div>
        </div>
      </main>

      {/* Quality Standards Demonstration */}
      <section className="py-16 px-8 max-w-6xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 bg-white border border-gray-200 rounded-card shadow-sm flex flex-col gap-3">
          <div className="w-10 h-10 rounded-avatar bg-accent-gold/10 flex items-center justify-center text-accent-gold font-bold">
            01
          </div>
          <h3 className="text-xl font-bold text-primary-900">Premium Fleet</h3>
          <p className="text-gray-500 text-small-body">
            Hand-picked, high-end vehicles kept in pristine, showroom condition for your driving pleasure.
          </p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-card shadow-sm flex flex-col gap-3">
          <div className="w-10 h-10 rounded-avatar bg-accent-gold/10 flex items-center justify-center text-accent-gold font-bold">
            02
          </div>
          <h3 className="text-xl font-bold text-primary-900">Airport Delivery</h3>
          <p className="text-gray-500 text-small-body">
            Seamless drop-off and pickup options at GOX (Mopa) & GOI (Dabolim) airports with zero waiting times.
          </p>
        </div>
        <div className="p-6 bg-white border border-gray-200 rounded-card shadow-sm flex flex-col gap-3">
          <div className="w-10 h-10 rounded-avatar bg-accent-gold/10 flex items-center justify-center text-accent-gold font-bold">
            03
          </div>
          <h3 className="text-xl font-bold text-primary-900">Concierge Service</h3>
          <p className="text-gray-500 text-small-body">
            Personalized client coordinators and B2B partners assistance, offering white-glove check-ins and support.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-bg-footer py-8 px-8 border-t border-gray-700 text-center text-gray-400 text-caption">
        <p>&copy; {new Date().getFullYear()} 3M Car Rentals. All rights reserved.</p>
      </footer>
    </div>
  );
}
