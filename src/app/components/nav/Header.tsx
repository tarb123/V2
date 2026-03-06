'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image'; // ✅ import Next.js Image
import '@fortawesome/fontawesome-free/css/all.min.css';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram } from 'react-icons/fa';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <>
      {/* DESKTOP HEADER */}
      <header className="hidden md:flex flex-col fixed w-full bg-white z-50">
        <div className="flex items-center justify-between px-6 ">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Link href="/">
              <Image
                src="/sanjeeda logo1.png" // ✅ served from public folder
                alt="Website Logo"
                width={280}   // adjust size
                height={100}
                priority
              />
            </Link>
          </div>

          {/* Right: Social Icons */}
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-Blue hover:text-black text-xl">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#1DA1F2] hover:text-black text-xl">
              <FaTwitter />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-[#0077B5] hover:text-black text-xl">
              <FaLinkedinIn />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#E4405F] hover:text-black text-xl">
              <FaInstagram />
            </a>
          </div>
        </div>

{/* NAVBAR */}
<nav className="flex -mt-2 px-9 items-center gap-3 bg-gradient-to-r from-[#ea2626] to-[#014FB7] relative text-white">
{/* <nav className="flex -mt-2 px-9 items-center gap-6 bg-gradient-to-r from-[#ff0000] to-[#014DB5] relative text-white"> */}
{/* Services Dropdown */} 

<div className="relative group"> 
  <button className="font-sans serif font-semibold text-sm text-white duration-200 relative px-2 py-1 overflow-hidden" onClick={() => setServicesOpen(!servicesOpen)} aria-expanded={servicesOpen} > 
  <span className="flex items-center text-inherit">
  <i className="fa fa-graduation-cap mr-1 text-inherit" aria-hidden="true"></i>
  Services
  </span> 
  
  <span className="absolute bottom-0 left-0 h-[2px] bg-white transition-all duration-300 w-0 group-hover:w-full"></span> 
  </button>
    
    {servicesOpen && ( 
      // <ul className="absolute mt-2 bg-gradient-to-r from-Red to-[#484dcd] shadow-md rounded py-1 w-44 z-50"> 
      <ul className="absolute mt-1 text-sm font-sans serif font-semibold bg-gradient-to-r from-Red to-[#484dcd] shadow-md rounded w-44 z-50"> 
    <li>
      <Link href="/FinancialOffer" className="block px-4 py-2">
      <span className="flex items-center"><i className="fa fa-calculator mr-2 text-inherit" aria-hidden="true"></i>Offer Calculator</span> 
      </Link> 
    </li> 
      
    <li> 
      <Link href="/cv" className="block px-4 py-2">
      <span className="flex items-center"><i className="fa fa-cube mr-2 text-inherit" aria-hidden="true"></i>3D CVs</span> 
      </Link> 
    </li> 

    <li> 
      <Link href="/cv-upload" className="block px-4 py-2"> 
      <span className="flex items-center"><i className="fa fa-upload mr-2 text-inherit" aria-hidden="true"></i>Upload CV </span> 
      </Link>
    </li>
    </ul> 
  )} 
  
  </div> 
          
  <Link href="/Team" className="relative text-white text-base px-3 py-1 transition duration-300 group"> 
  <i className="fa fa-users mr-1 text-white "aria-hidden="true"></i> 
  <span className="font-sans serif font-semibold text-white text-sm">Team</span> 
  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span> 
  </Link> 
          
  <Link href="/Blogs/" className="relative text-white text-sm px-3 py-1 transition duration-300 group"> 
  <i className="fa fa-file-alt text-white" aria-hidden="true"></i> 
  <span className="font-sans serif font-semibold text-white text-sm">Blogs</span> 
  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span> 
  </Link> 

<Link
  href="/education"
  className="relative text-white text-sm px-3 py-1 transition duration-300 group"
>
  <i className="fa fa-file-alt text-white" aria-hidden="true"></i>
  <span className="font-sans serif font-semibold text-white text-sm">Education</span>
  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
</Link>
          
  <Link href="/Main" className="relative text-white  px-3 py-1 transition duration-300 group"> 
  <i className="fa fa-clipboard-list fa-brain mr-1 text-white" aria-hidden="true"></i> 
  <span lang="ur" className="font-urdu text-lg font-bold text-white">خودی</span>{' '} 
  <span className="font-sans serif font-semibold text-white">Personality Assessment</span> 
  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span> 
  </Link>   

  {/* <Link href="/CRR/" className="relative text-white text-sm px-3 py-1 transition duration-300 group"> 
  <i className="fa fa-file-alt text-white" aria-hidden="true"></i> 
  <span className="font-sans serif font-semibold text-white text-sm">CRR</span> 
  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span> 
  </Link>  */}

<div className="ml-auto">
  <Link href="/login" className="text-white text-base py-1 group">
  <i className="fa fa-lock-open"></i>{/* "fa fa-user-circle"       "fa fa-arrow-right-to-bracket" */}
  <span className="font-sans serif font-semibold"> Login</span>
</Link>
</div>
  </nav>
  </header>

      {/* MOBILE HEADER */}
      <div className="flex justify-center items-center py-2">
        <Link href="/">
          <Image src="/sanjeeda logo1.png" alt="Website Logo" width={210} height={40} priority/>
        </Link>
      
      <Link href="/login">Log In</Link>

      </div>

      <div className="mb-20 flex md:hidden justify-between items-center px-4 py-2 shadow-md h-[58px] fixed top-0 w-full z-50">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-2xl focus:outline-none text-black font-bold">☰</button>
      </div>

      {/* <a href="/signup">Log In</a> */}


      {/* MOBILE NAVBAR */}

  {menuOpen && (
      <nav className="fixed top-[60px] left-0 h-[600px] w-[250px] bg-gradient-to-t from-Blue to-Red backdrop-blur-lg z-50 flex flex-col p-4 shadow-lg">
      <button onClick={() => setMenuOpen(false)} className="self-end text-1xl text-white font-bold mb-4">X</button>
    
          
      <Link href="/Team" className="mb-2 relative text-white text-base py-1 transition duration-300 group">
      <i className="fa fa-users mr-2" aria-hidden="true"></i>
      <span className="font-[Jameel Noori Nastaleeq] transition-colors duration-300 text-white">Team</span>
      <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-Red transition-all duration-300 group-hover:w-full"></span>
      </Link>
    
      <Link href="/Blogs/" className="mb-2 relative text-white text-base py-1 transition duration-300 group">
      <i className="fa fa-file-alt mr-2" aria-hidden="true"></i>
      <span className="font-[Jameel Noori Nastaleeq] transition-colors duration-300 text-white">Blogs</span>
      <span className="absolute bottom-0 left-0 w-0 h-[3px] bg-Red transition-all duration-300 group-hover:w-full"></span>
      </Link>
{/* 
      <Link href="/Main" className="mb-2 relative text-white text-base py-1 transition duration-300 group">
        <i className="fa fa-clipboard-list fa-brain mr-2" aria-hidden="true"></i>
        <span className="font-[Jameel Noori Nastaleeq] transition-colors duration-300 text-white group-hover:text-Red">خودی</span>{' '}
        <span className="ml-1">Personality Assessment</span>
        <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-Red transition-all duration-300 group-hover:w-full"></span>
      </Link> */}

        <Link href="/Main" className="mb-2 relative text-white text-base py-1 transition duration-300 group"> 
  <i className="fa fa-clipboard-list fa-brain mr-1 text-white" aria-hidden="true"></i> 
  <span lang="ur" className="font-urdu text-lg font-bold text-white">خودی</span>{' '} 
  <span className="font-sans serif font-semibold text-white">Personality Assessment</span> 
  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span> 
  </Link>      
  <Link href="/CRR/" className="mb-2 relative text-white text-base py-1 transition duration-300 group"> 
  <i className="fa fa-file-alt text-white" aria-hidden="true"></i> 
  <span className="font-sans serif font-semibold text-white text-sm">CRR</span> 
  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span> 
  </Link> 

      <div className="text-white">
        <i className="fa fa-graduation-cap mr-2 text-inherit" aria-hidden="true"></i>
        <button onClick={() => setServicesOpen(!servicesOpen)} className='mb-2'>Services
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-green transition-all duration-300 group-hover:w-full"></span>

        </button>

        {servicesOpen && (
        <div className="pl-4 space-y-2">
        <ul>
        <li>
          <Link href="/FinancialOffer" className="text-white "> 
          <span className="flex items-center text-sm mb-2">
            <i className="fa fa-calculator mr-2 text-inherit  " aria-hidden="true"></i>Offer Calculator 
          </span>         
          </Link>
        </li>

        <li>
          <Link href="/cv"> 
          <span className="flex items-center text-sm mb-2">
            <i className="fa fa-cube mr-2 text-inherit" aria-hidden="true"></i>3D CVs 
          </span> 
          </Link>
        </li>
        <li>
          <Link href="/cv-upload"> 
          <span className="flex items-center text-sm mb-2">
            <i className="fa fa-upload mr-2 text-inherit" aria-hidden="true"></i>Upload CV
          </span>  
          </Link>
        </li> 
         </ul>
          </div>
        
        )}
      </div>
      
        </nav>
      )}




    </>
  );
};

export default Header;
