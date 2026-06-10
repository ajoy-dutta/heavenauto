import { Link } from "react-router-dom";
import { IoMdGitCompare } from "react-icons/io";
import {
  FiSearch,
  FiPhone,
  FiHeart,
  FiShoppingCart,
  FiUser,
} from "react-icons/fi";

const Header = () => {
  return (
    <header className="w-full font-sans">
      {/* Top Dark Bar */}
      <div className="bg-ha-dark text-white py-4 px-6 md:px-12 flex flex-wrap items-center justify-between gap-4">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-white flex items-center gap-2"
        >
          <span className="bg-ha-red px-2 py-1 rounded-md text-sm">AUTO</span>
          HEAVEN AUTOS
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl hidden md:flex items-center bg-white rounded-full overflow-hidden h-10 text-gray-800">
          <div className="pl-4 text-ha-red">
            <FiSearch size={18} />
          </div>
          <input
            type="text"
            placeholder="Search parts by name, model..."
            className="w-full px-3 py-2 outline-none text-sm"
          />
          <div className="border-l border-gray-300 h-6"></div>
          <select className="bg-transparent px-3 py-2 outline-none text-sm font-medium cursor-pointer">
            <option>Search By Vehicle</option>
            <option>Toyota</option>
            <option>Honda</option>
          </select>
          <button className="bg-ha-red text-white px-6 h-full font-semibold flex items-center gap-2 hover:bg-red-700 transition">
            <FiSearch /> Find Parts
          </button>
        </div>

        {/* Contact & Icons */}
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-2">
            <FiPhone size={20} className="text-ha-red" />
            <div>
              <p className="text-xs text-gray-400">Call Us (10.00am-8.00pm)</p>
              <p className="text-lg font-bold">01905400666</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xl">
            <FiHeart className="cursor-pointer hover:text-ha-red transition" />
            <IoMdGitCompare className="cursor-pointer hover:text-ha-red transition" />
            <FiShoppingCart className="cursor-pointer hover:text-ha-red transition" />
            <div className="flex items-center gap-2 cursor-pointer hover:text-ha-red transition text-base font-semibold">
              <FiUser /> <span className="hidden sm:block">Sign In</span>
            </div>
          </div>
        </div>
      </div>

      {/* Red Navigation Bar */}
      <div className="bg-ha-red text-white px-6 md:px-12 flex items-center justify-between h-14">
        <nav className="hidden md:flex items-center gap-6 text-sm font-bold tracking-wide">
          <Link to="/" className="hover:text-gray-200 transition">
            HOME
          </Link>
          <Link to="/about" className="hover:text-gray-200 transition">
            ABOUT US
          </Link>
          {/* Added Dashboard Link Here */}
          
          <Link
            to="/parts"
            className="hover:text-gray-200 transition flex items-center gap-1"
          >
            CAR PARTS ▾
          </Link>
          <Link
            to="/tyres"
            className="hover:text-gray-200 transition flex items-center gap-1"
          >
            TYRES ▾
          </Link>
          <Link
            to="/lubricant"
            className="hover:text-gray-200 transition flex items-center gap-1"
          >
            LUBRICANT ▾
          </Link>
          <Link to="/sale" className="hover:text-gray-200 transition">
            SALE OFFER
          </Link>
          <Link to="/locator" className="hover:text-gray-200 transition">
            STORE LOCATOR
          </Link>
          <Link to="/contact" className="hover:text-gray-200 transition">
            CONTACT
          </Link>
          <Link
            to="/dashboard"
            className="hover:text-gray-200 transition text-yellow-300"
          >
            DASHBOARD
          </Link>
        </nav>

        <button className="bg-white text-ha-red px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2 hover:bg-gray-100 transition ml-auto md:ml-0">
          <IoMdGitCompare className="rotate-90" /> Track Order
        </button>
      </div>
    </header>
  );
};

export default Header;
