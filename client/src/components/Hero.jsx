import { FiArrowRight, FiSearch, FiStar, FiShoppingCart } from "react-icons/fi";
import HeroImage from '../assets/hero-parts.png';

const Hero = () => {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-black via-gray-900 to-[#3a0a0c] text-white py-16 px-6 md:px-12 md:py-24">
      
      {/* Background abstract curves (simulated with CSS) */}
      <div className="absolute top-0 right-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute -right-1/4 -top-1/4 w-1/2 h-[150%] bg-ha-red rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
        
        {/* Left Content Area */}
        <div className="w-full md:w-1/2 flex flex-col items-start gap-6">
          <div className="border border-ha-red/50 text-ha-red px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider flex items-center gap-2 bg-ha-red/10">
            <FiStar /> PREMIUM QUALITY
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Premium Automotive <br />
            <span className="text-ha-red">Parts & Accessories</span>
          </h1>
          
          <p className="text-gray-300 text-lg max-w-md">
            Discover top-quality automotive parts from world-renowned manufacturers with guaranteed authenticity.
          </p>
          
          <div className="flex items-center gap-4 mt-4">
            <button className="bg-ha-red hover:bg-red-700 text-white px-6 py-3 rounded flex items-center gap-2 font-bold transition">
              <FiShoppingCart /> Shop Now <FiArrowRight />
            </button>
            <button className="border border-ha-red text-white hover:bg-ha-red/10 px-6 py-3 rounded flex items-center gap-2 font-bold transition">
              <FiSearch /> Find My Part <FiArrowRight />
            </button>
          </div>
        </div>

        {/* Right Image Area */}
        <div className="w-full md:w-1/2 mt-12 md:mt-0 relative flex justify-center">
          <div className="relative w-[400px] h-[400px] md:w-[500px] md:h-[500px] flex items-center justify-center">
            
            {/* The actual product image */}
            <img 
              src={HeroImage} 
              alt="Premium Automotive Parts" 
              className="w-full h-full object-contain drop-shadow-2xl relative z-10 hover:scale-105 transition-transform duration-500 ease-out" 
            />
            
            {/* Decorative background glow centered behind the image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-ha-red/20 rounded-full blur-[80px] pointer-events-none z-0"></div>
            
          </div>
        </div>

      </div>
    </div>
  );
};

export default Hero;