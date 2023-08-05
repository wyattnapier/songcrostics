import { useRef } from "react";
import { FaBars, FaTimes, FaPollH } from "react-icons/fa";
import "./App.css";

function Navbar() {
  const navRef = useRef();
  const showNavbar = () => {
    navRef.current.classList.toggle("responsive_nav");
  };

  return (
    <header>
      <h1>
        <FaPollH/> Songcrostics
      </h1>
      <nav ref={navRef}>
        <a href="/#">Home</a>
        <a href="/#">Generate</a>
        <a href="/#">About</a>
        <a href="/#">Help</a>
        <button className="nav-btn nav-close-btn" onClick={showNavbar}>
          <FaTimes/>
        </button>
      </nav>
      <button className="nav-btn" onClick={showNavbar}>
        <FaBars/>
      </button>
    </header>
  );
}

export default Navbar;
