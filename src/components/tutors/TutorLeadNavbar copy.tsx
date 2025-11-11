import { Link } from 'react-router-dom';

export const TutorLeadNavbar = () => {
  return (
    <nav className="fixed bg-[#001F54] top-0 left-0 right-0  shadow-md z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="rounded-full overflow-hidden h-12 w-12 border-2 border-[#001F54]/20 shadow-lg flex items-center justify-center bg-white hover:scale-105 transition-transform duration-300">
              <img 
                src="/1.jpg" 
                alt="YourShikshak Logo" 
                className="h-10 w-10 object-cover transform scale-110"
                onError={(e) => {
                  e.currentTarget.src = 'https://yourshikshak.in/assets/1-CFq2Wthp.jpg';
                }}
              />
            </div>
            <div>
              <h1 className="font-bold text-xl text-white group-hover:text-[#0056b3] transition-colors">
                YourShikshak
              </h1>
              <p className="text-xs text-white">Empowering Education</p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              to="/" 
              className="text-white hover:text-[#0056b3] font-medium transition-colors"
            >
              Home
            </Link>
            <Link 
              to="/blog" 
              className="text-white hover:text-[#0056b3] font-medium transition-colors"
            >
              Blog
            </Link>
            <Link 
              to="/#contact" 
              className="text-white hover:text-[#0056b3] font-medium transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};