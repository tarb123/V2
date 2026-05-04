'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  return (
    <>
      {/* DESKTOP HEADER */}
      <header className="hidden md:flex flex-col fixed w-full bg-white z-50 shadow-sm">
        <div className="flex items-center justify-between px-2 py-0">
         
          {/* Left Logo */}
          <Link href="https://sanjeeda.io" className="flex items-center -mb-2">
            <Image src="/sanjeeda logo1.png"
              alt="Website Logo" width={200} height={100}
              priority className="h-auto w-auto object-contain"
            />
          </Link>

<Link href="https://conductivity.com.pk" className="flex items-center justify-end shrink-0" aria-label="Conductivity Logo">
  <Image src="/conductivitylogo.png" alt="Conductivity Logo" width={180} height={10} priority className="h-14 w-56"/>
</Link>
        </div>

        <nav className="flex -mt-2 px-9 items-center gap-3 bg-gradient-to-r from-[#ea2626] to-[#014FB7] relative text-white">
          <div className="relative group">
            <button
              className="font-sans serif font-semibold text-sm text-white duration-200 relative px-2 py-1 overflow-hidden"
              onClick={() => setServicesOpen(!servicesOpen)}
              aria-expanded={servicesOpen}
            >
              <span className="flex items-center text-inherit">
                <i className="fa fa-graduation-cap mr-1 text-inherit" aria-hidden="true"></i>
                Services
              </span>

              <span className="absolute bottom-0 left-0 h-[2px] bg-white transition-all duration-300 w-0 group-hover:w-full"></span>
            </button>

            {servicesOpen && (
              <ul className="absolute mt-1 text-sm font-sans serif font-semibold bg-gradient-to-r from-Red to-[#484dcd] shadow-md rounded w-44 z-50">
                <li>
                  <Link href="/FinancialOffer" className="block px-4 py-2">
                    <span className="flex items-center">
                      <i className="fa fa-calculator mr-2 text-inherit" aria-hidden="true"></i>
                      Offer Calculator
                    </span>
                  </Link>
                </li>

                <li>
                  <Link href="/cv" className="block px-4 py-2">
                    <span className="flex items-center">
                      <i className="fa fa-cube mr-2 text-inherit" aria-hidden="true"></i>
                      3D CVs
                    </span>
                  </Link>
                </li>

                <li>
                  <Link href="/cv-upload" className="block px-4 py-2">
                    <span className="flex items-center">
                      <i className="fa fa-upload mr-2 text-inherit" aria-hidden="true"></i>
                      Upload CV
                    </span>
                  </Link>
                </li>
              </ul>
            )}
          </div>

          <Link href="/KhudiPersonalityAssessment" className="relative text-white px-3 py-1 transition duration-300 group">
            <i className="fa fa-clipboard-list fa-brain mr-1 text-white" aria-hidden="true"></i>
            <span lang="ur" className="font-urdu text-lg font-bold text-white">خودی</span>{' '}
            <span className="font-sans serif font-semibold text-white">Personality Assessment</span>
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <Link href="/Blogs/" className="relative text-white text-sm px-3 py-1 transition duration-300 group">
            <i className="fa fa-file-alt text-white" aria-hidden="true"></i>
            <span className="font-sans serif font-semibold text-white text-sm">Blogs</span>
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <Link href="/education" className="relative text-white text-sm px-3 py-1 transition duration-300 group">
            <i className="fa fa-file-alt text-white" aria-hidden="true"></i>
            <span className="font-sans serif font-semibold text-white text-sm">Education</span>
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
          </Link>

          <Link href="/pgp-access" className="relative text-white text-sm px-3 py-1 transition duration-300 group">
            <i className="fa fa-graduation-cap text-white"></i>
            <span className="font-semibold text-white text-sm ml-1">PGP</span>
            <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-white transition-all duration-300 group-hover:w-full"></span>
          </Link>

 <div className="ml-auto flex items-center">
  <Link
    href="/login"
    className="inline-flex h-8 items-center gap-2 bg-[#014FB7] px-4 text-sm font-medium text-white transition hover:bg-[#014FB7]-100"
  >
    <i className="fa fa-sign-in-alt text-xs" aria-hidden="true"></i>
    <span>Login</span>
  </Link>
</div>
        </nav>
      </header>

      {/* MOBILE HEADER */}
      <header className="md:hidden fixed top-0 left-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="flex items-center justify-between px-4 h-[64px]">
          {/* Left: Menu */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-2xl text-slate-800 hover:bg-slate-100"
            aria-label="Open menu"
          >
            ☰
          </button>

          {/* Center: Main Logo */}
          <Link href="/" className="flex items-center justify-center">
            <Image
              src="/sanjeeda logo1.png" alt="Website Logo" width={190} height={100} priority
              className="h-auto w-auto object-contain"
            />
          </Link>

          {/* Right: Conductivity Logo */}
          <Link
            href="/"
            className="flex items-center justify-end"
            aria-label="Conductivity Logo"
          >
            <Image
              src="/conductivitylogo.png" alt="Conductivity Logo" width={120} height={5}
              priority className="h-auto w-auto object-contain"
            />
          </Link>
        </div>
      </header>

      {/* MOBILE DRAWER OVERLAY */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* MOBILE DRAWER */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-[60] h-full w-[280px] bg-gradient-to-b from-[#014FB7] to-[#ea2626] text-white shadow-2xl transform transition-transform duration-300 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 h-[64px] border-b border-white/20">
          <span className="text-lg font-bold">Menu</span>
          <button
            onClick={() => setMenuOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-xl"
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <div className="px-4 pt-4">
          <Link
            href="/login"
            className="flex items-center justify-center rounded-lg bg-white text-[#014FB7] px-4 py-3 text-sm font-semibold shadow-sm"
            onClick={() => setMenuOpen(false)}
          >
            <i className="fa fa-lock-open mr-2"></i>
            Log In
          </Link>
        </div>

        <nav className="flex flex-col gap-1 p-4 text-sm">
          <Link
            href="/KhudiPersonalityAssessment"
            className="rounded-lg px-3 py-3 hover:bg-white/10"
            onClick={() => setMenuOpen(false)}
          >
            <i className="fa fa-clipboard-list mr-2" aria-hidden="true"></i>
            <span lang="ur" className="font-urdu text-lg font-bold">خودی</span>{' '}
            <span className="ml-1">Personality Assessment</span>
          </Link>

          <Link
            href="/pgp-access"
            className="rounded-lg px-3 py-3 hover:bg-white/10"
            onClick={() => setMenuOpen(false)}
          >
            <i className="fa fa-graduation-cap mr-2" aria-hidden="true"></i>
            <span className="ml-1">PGP</span>
          </Link>

          <Link
            href="/education"
            className="rounded-lg px-3 py-3 hover:bg-white/10"
            onClick={() => setMenuOpen(false)}
          >
            <i className="fa fa-graduation-cap mr-2" aria-hidden="true"></i>
            Education
          </Link>

          <button
            onClick={() => setServicesOpen(!servicesOpen)}
            className="flex items-center justify-between rounded-lg px-3 py-3 text-left hover:bg-white/10"
          >
            <span>
              <i className="fa fa-certificate mr-2" aria-hidden="true"></i>
              Services
            </span>
            <span>{servicesOpen ? '−' : '+'}</span>
          </button>

          {servicesOpen && (
            <div className="ml-3 mt-1 flex flex-col gap-1 border-l border-white/30 pl-3">
              <Link
                href="/FinancialOffer"
                className="rounded-lg px-3 py-2 text-sm hover:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                <i className="fa fa-calculator mr-2" aria-hidden="true"></i>
                Offer Calculator
              </Link>

              <Link
                href="/cv"
                className="rounded-lg px-3 py-2 text-sm hover:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                <i className="fa fa-cube mr-2" aria-hidden="true"></i>
                3D CVs
              </Link>

              <Link
                href="/cv-upload"
                className="rounded-lg px-3 py-2 text-sm hover:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                <i className="fa fa-upload mr-2" aria-hidden="true"></i>
                Upload CV
              </Link>
            </div>
          )}

          <Link
            href="/Blogs/"
            className="rounded-lg px-3 py-3 hover:bg-white/10"
            onClick={() => setMenuOpen(false)}
          >
            <i className="fa fa-file-alt mr-2" aria-hidden="true"></i>
            Blogs
          </Link>
        </nav>
      </aside>

      {/* PAGE SPACER FOR MOBILE */}
      <div className="h-[64px] md:hidden" />
    </>
  );
};

export default Header;