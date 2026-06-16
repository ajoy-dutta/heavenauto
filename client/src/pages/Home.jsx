import { Link } from "react-router-dom";
import { FiArrowRight, FiShield, FiTruck, FiSettings } from "react-icons/fi";

export default function Home() {
  return (
    <div className="bg-white overflow-hidden">
      
      {/* --- HERO SECTION --- */}
      {/* Reduced padding from py-20/32 to py-12/16 to save vertical space */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          
          {/* Left Text Content */}
          <div className="w-full lg:w-1/2 flex flex-col items-start text-left z-10">
            {/* Blue Theme Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-semibold text-sm mb-4 border border-blue-100">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
              </span>
              Top-Tier Moto Parts Store
            </div>
            
            {/* Tighter heading sizes */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4">
              Upgrade Your Ride with <span className="text-blue-600">Heaven Autos</span>
            </h1>
            
            <p className="text-base md:text-lg text-gray-600 mb-6 max-w-lg leading-relaxed">
              The premier destination for high-performance motorcycle parts, accessories, and maintenance essentials. Built for the road, delivered with trust.
            </p>
            
            {/* Slimmer buttons */}
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Link 
                to="/products" 
                className="inline-flex justify-center items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-blue-200"
              >
                Explore Catalog <FiArrowRight className="text-lg" />
              </Link>
              <Link 
                to="/contact" 
                className="inline-flex justify-center items-center px-6 py-3 rounded-lg font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* Right Image Content */}
          <div className="w-full lg:w-1/2 relative">
            {/* Subtle blue background decorative blob */}
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-100 to-slate-50 rounded-2xl transform rotate-2 scale-105 -z-10"></div>
            
            {/* Reduced image height (h-300px/400px instead of 400px/550px) */}
            <img
              src="https://images.unsplash.com/photo-1558981420-c532902e58b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
              alt="Premium Motorcycle Engine Parts"
              className="rounded-2xl shadow-xl object-cover h-[280px] md:h-[400px] w-full border-4 border-white"
            />
          </div>
        </div>
      </div>

      {/* --- QUICK FEATURES BANNER --- */}
      {/* Navy Blue background (slate-900) and reduced vertical padding (py-8) */}
      <div className="bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-700">
            
            <div className="flex flex-col items-center pt-4 md:pt-0">
              <div className="p-3 bg-slate-800 rounded-full mb-3 text-blue-400 shadow-sm">
                <FiSettings className="w-6 h-6" />
              </div>
              <h3 className="text-white font-semibold text-base mb-1">Genuine Parts</h3>
              <p className="text-slate-400 text-xs px-4">100% authentic components sourced directly from trusted manufacturers.</p>
            </div>

            <div className="flex flex-col items-center pt-6 md:pt-0">
              <div className="p-3 bg-slate-800 rounded-full mb-3 text-blue-400 shadow-sm">
                <FiTruck className="w-6 h-6" />
              </div>
              <h3 className="text-white font-semibold text-base mb-1">Fastest Delivery</h3>
              <p className="text-slate-400 text-xs px-4">Nationwide rapid shipping to get you back on the road instantly.</p>
            </div>

            <div className="flex flex-col items-center pt-6 md:pt-0">
              <div className="p-3 bg-slate-800 rounded-full mb-3 text-blue-400 shadow-sm">
                <FiShield className="w-6 h-6" />
              </div>
              <h3 className="text-white font-semibold text-base mb-1">Warranty Backed</h3>
              <p className="text-slate-400 text-xs px-4">Buy with confidence with our comprehensive replacement warranty.</p>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}