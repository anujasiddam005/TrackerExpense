import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, User, LogOut } from "lucide-react";

import { navbarStyles } from "../assets/dummyStyles";
import img1 from "../assets/logo.png";
import axios from "axios";

const BASE_URL = "http://localhost:4000/api";

const Navbar = ({ user: propUser, onLogout }) => {
  const navigate = useNavigate();

  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(
    propUser || {
      name: "",
      email: "",
    },
  );

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");

        if (!token) return;

        const response = await axios.get(`${BASE_URL}/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userdata = response.data.user || response.data;

        setUser(userdata);
      } catch (error) {
        console.error("Fetch User Error:", error);
      }
    };
    if (!propUser) {
      fetchUserData();
    }
  }, [propUser]);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };
  const handleLogout = () => {
    setMenuOpen(false);
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    onLogout?.();

    navigate("/login");
  };
  // closes the toggle menu if click outside the box
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className={navbarStyles.header}>
      <div className={navbarStyles.container}>
        {/* ================= LOGO ================= */}

        <div
          onClick={() => navigate("/")}
          className={navbarStyles.logoContainer}
        >
          <div className={navbarStyles.logoImage}>
            <img src={img1} alt="Expense Tracker Logo" />
          </div>

          <span className={navbarStyles.logoText}>Expense Tracker</span>
        </div>

        {/* ================= USER ================= */}
        {user && (
          <div className={navbarStyles.userContainer} ref={menuRef}>
            {/* User Button */}
            <button
              type="button"
              onClick={toggleMenu}
              className={navbarStyles.userButton}
            >
              {/* Avatar */}
              <div className="relative">
                <div className={navbarStyles.userAvatar}>
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>

                <div className={navbarStyles.statusIndicator}></div>
              </div>

              {/* User Details */}
              <div className={navbarStyles.userTextContainer}>
                <p className={navbarStyles.userName}>{user?.name || "User"}</p>

                <p className={navbarStyles.userEmail}>
                  {user?.email || "user@expensetracker.com"}
                </p>
              </div>

              {/* Arrow */}
              <ChevronDown className={navbarStyles.chevronIcon(menuOpen)} />
            </button>

            {/* ================= DROPDOWN ================= */}
            {menuOpen && (
              <div className={navbarStyles.dropdownMenu}>
                {/* Dropdown Header */}
                <div className={navbarStyles.dropdownHeader}>
                  <div className="flex items-center gap-3">
                    {/* Dropdown Avatar */}
                    <div className={navbarStyles.dropdownAvatar}>
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>

                    {/* Dropdown User Details */}
                    <div>
                      <div className={navbarStyles.dropdownName}>
                        {user?.name || "User"}
                      </div>

                      <div className={navbarStyles.dropdownEmail}>
                        {user?.email || "user@expensetracker.com"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ================= MENU ITEMS ================= */}
                <div className={navbarStyles.menuItemContainer}>
                  {/* My Profile */}
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                    className={navbarStyles.menuItem}
                  >
                    <User className="w-4 h-4" />

                    <span>My Profile</span>
                  </button>

                  {/* Logout */}
                  <div className={navbarStyles.menuItemBorder}>
                    <button
                      onClick={handleLogout}
                      className={navbarStyles.logoutButton}
                    >
                      <LogOut className="w-4 h-4" />

                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
