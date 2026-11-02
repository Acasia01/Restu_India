import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import api from "../../services/api";
import toast from "react-hot-toast";

import DashboardTab from "./tabs/DashboardTab/DashboardTab";
import CategoryTab from "./tabs/CategoryTab/CategoryTab";
import ProductsTab from "./tabs/ProductsTab/ProductsTab";
import UsersTab from "./tabs/UsersTab/UsersTab";
import EnquiriesTab from "./tabs/EnquiriesTab/EnquiriesTab";

import {
  LayoutDashboard,
  Package,
  Folder,
  Users,
  MessageSquare,
  Store,
  LogOut,
  Bell,
  MessageCircle,
  Search
} from "lucide-react";

import "./AdminPage.css";

const TABS = [
  "Dashboard",
  "Categories",
  "Products",
  "Users",
  "Enquiries",
];

const SIDEBAR_ITEMS = [
  { name: "Dashboard",  icon: LayoutDashboard, tab: "Dashboard" },
  { name: "Products",   icon: Package,          tab: "Products" },
  { name: "Categories", icon: Folder,            tab: "Categories" },
  { name: "Customers",  icon: Users,             tab: "Users" },
  { name: "Enquiries",  icon: MessageSquare,     tab: "Enquiries" },
];

export default function AdminPage() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("Dashboard");

  // Theme state (persisted)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("admin_theme") === "dark";
  });

  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("admin_theme", next ? "dark" : "light");
      return next;
    });
  };

  // Counts states
  const [newEnquiriesCount, setNewEnquiriesCount] = useState(0);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  const fetchCounts = async () => {
    try {
      const [enqRes, ordRes] = await Promise.all([
        api.get("/enquiries"),
        api.get("/orders"),
      ]);
      const enquiries = enqRes.data?.enquiries || [];
      const orders = ordRes.data?.orders || [];

      const newEnqCount = enquiries.filter((e) => e.status === "new").length;
      const pendOrdCount = orders.filter((o) => o.status === "pending").length;

      setNewEnquiriesCount(newEnqCount);
      setPendingOrdersCount(pendOrdCount);
    } catch (err) {
      console.error("Failed to fetch notification counts:", err);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchCounts();
      const interval = setInterval(fetchCounts, 15000); // refresh counts every 15s
      return () => clearInterval(interval);
    }
  }, [user, isAdmin]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    if (user === null) {
      navigate("/");
      return;
    }
    if (user && !isAdmin) {
      toast.error("Admin access only");
      navigate("/");
    }
  }, [user, isAdmin, navigate]);

  if (!user || !isAdmin) return null;

  // Determine page title and subtitle dynamically
  const pageMeta = {
    Dashboard:   { title: "Dashboard", subtitle: "Here's what's happening with your store today." },
    Products:    { title: "Products", subtitle: "Manage your product catalog and inventory." },
    Categories:  { title: "Categories", subtitle: "Organize your products into categories." },
    Users:       { title: "Customers", subtitle: "View and manage your customer base." },
    Enquiries:   { title: "Enquiries", subtitle: "Respond to customer questions and queries." },
  };

  const meta = pageMeta[tab] || pageMeta.Dashboard;

  return (
    <div className={`admin-layout ${darkMode ? "admin-dark" : ""}`}>
      {/* ===== SIDEBAR ===== */}
      <aside className="admin-sidebar">
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="sidebar-logo-shield">
            <Store size={20} className="logo-icon" />
          </div>
          <span className="sidebar-brand-name">ResatuIndia</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = tab === item.tab;
            return (
              <button
                key={item.name}
                onClick={() => setTab(item.tab)}
                className={`sidebar-nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={18} className="sidebar-icon" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        {/* Spacer to push profile to bottom */}
        <div style={{ flex: 1 }} />

        {/* User profile footer */}
        <div className="sidebar-profile">
          <div className="profile-avatar">
            <img
              src="/restu-india-logo.png"
              alt="Resatu India"
              className="profile-avatar-img"
              onError={(e) => { e.target.style.display = "none"; }}
            />
            <span className="profile-avatar-fallback">{user.name?.[0]?.toUpperCase() || "A"}</span>
          </div>
          <div className="profile-info">
            <div className="profile-name">{user.name || "System Admin"}</div>
            <div className="profile-email">{user.email}</div>
          </div>
        </div>
      </aside>

      {/* ===== MAIN PANEL ===== */}
      <div className="admin-main">
        {/* Top Header */}
        <header className="admin-topbar">
          <div className="topbar-left">
            {/* Search — hidden on mobile */}
            <div className="topbar-search-wrapper">
              <Search size={16} className="search-icon" />
              <input type="text" placeholder="Search anything..." className="topbar-search-input" />
              <span className="search-shortcut">Ctrl + K</span>
            </div>
            {/* Mobile brand */}
            <div className="mobile-brand-wrapper">
              <Store size={18} className="logo-icon-mobile" />
              <span className="mobile-brand-name">ResatuIndia</span>
              <span className="mobile-admin-badge">Admin</span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-utility-icons">
              <button 
                className="utility-btn" 
                aria-label="Toggle Theme"
                onClick={toggleTheme}
                style={{ fontSize: "16px" }}
              >
                {darkMode ? "🌙" : "☀️"}
              </button>
              <button 
                className="utility-btn relative-btn" 
                aria-label="Notifications"
                onClick={() => setTab("Dashboard")}
              >
                <Bell size={18} />
                {pendingOrdersCount > 0 && (
                  <span className="btn-badge red-badge">{pendingOrdersCount}</span>
                )}
              </button>
              <button 
                className="utility-btn relative-btn" 
                aria-label="Messages"
                onClick={() => setTab("Enquiries")}
              >
                <MessageCircle size={18} />
                {newEnquiriesCount > 0 && (
                  <span className="btn-badge blue-badge">{newEnquiriesCount}</span>
                )}
              </button>
            </div>

            <div className="topbar-divider" />

            <div className="topbar-profile-box">
              <div className="topbar-avatar">{user.name?.[0]?.toUpperCase() || "A"}</div>
              <div className="topbar-profile-info">
                <div className="topbar-profile-name">{user.name || "System Admin"}</div>
                <div className="topbar-profile-role">Administrator</div>
              </div>
            </div>

            <div className="topbar-divider" />

            <div className="topbar-action-buttons">
              <button className="topbar-back-btn" onClick={() => navigate("/")} title="Back to Store">
                <Store size={14} /> <span>Store</span>
              </button>
              <button className="topbar-logout-btn" onClick={handleLogout} title="Logout">
                <LogOut size={14} /> <span>Logout</span>
              </button>
            </div>
          </div>
        </header>



        {/* Content */}
        <main className="admin-body">
          <div className="admin-body-header">
            <h1 className="welcome-title">{meta.title}</h1>
            <p className="welcome-subtitle">{meta.subtitle}</p>
          </div>

          <div className="admin-content">
            {tab === "Dashboard"  && <DashboardTab />}
            {tab === "Categories" && <CategoryTab />}
            {tab === "Products"   && <ProductsTab />}
            {tab === "Users"      && <UsersTab />}
            {tab === "Enquiries"  && <EnquiriesTab />}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav — CSS shows only on ≤1024px */}
      <nav className="mobile-bottom-nav">
        {[
          { name: "Home",      icon: LayoutDashboard, tab: "Dashboard" },
          { name: "Products",  icon: Package,          tab: "Products" },
          { name: "Customers", icon: Users,             tab: "Users" },
          { name: "Enquiries", icon: MessageSquare,     tab: "Enquiries" },
          { name: "Categories",icon: Folder,            tab: "Categories" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              className={`mobile-bottom-nav-btn ${tab === item.tab ? "active" : ""}`}
              onClick={() => setTab(item.tab)}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}