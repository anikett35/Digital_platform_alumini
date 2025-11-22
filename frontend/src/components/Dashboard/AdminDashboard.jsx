import React, { useState, useEffect } from "react";
import {
  Settings,
  Users,
  Calendar,
  BarChart3,
  Bell,
  Search,
  LogOut,
  Menu,
  X,
  Shield,
  MessageSquare,
  TrendingUp,
  ArrowRight,
  Plus,
  Edit,
  Trash2,
  Download,
  MapPin,
  Clock,
  Activity,
  UserPlus,
  CalendarPlus,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Chatbot from "../Common/Chatbot";
import MessagingPage from "../Messaging/MessagingPage";
import UsersManagement from "./UsersManagement";
import AnalyticsDashboard from "./AnalyticsDashboard";
import axios from "axios";

const API_URL = "http://localhost:5000/api";

// --- CONFIGURATION ---
const PRIMARY_TW_COLOR = "purple";
const ACCENT_TW_COLOR = "indigo";
const HEADER_GRADIENT = "from-purple-600 to-indigo-600";

// Admin Navbar Component
const AdminNavbar = ({ activeTab, onTabChange, onLogout, user }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const adminTabs = [
    { id: "dashboard", name: "Dashboard", icon: Activity },
    { id: "events", name: "Events", icon: Calendar },
    { id: "users", name: "Users", icon: Users },
    { id: "messages", name: "Messages", icon: MessageSquare },
    { id: "analytics", name: "Analytics", icon: BarChart3 },
    { id: "settings", name: "Settings", icon: Settings },
  ];

  const handleTabClick = (tabId) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-xl shadow-lg border-b border-gray-200"
          : "bg-white shadow-md"
      }`}
    >
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="relative">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${HEADER_GRADIENT} rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity`}
              ></div>
              <div
                className={`relative w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br ${HEADER_GRADIENT} rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform`}
              >
                <Shield className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1
                className={`text-lg lg:text-xl font-bold bg-gradient-to-r ${HEADER_GRADIENT} bg-clip-text text-transparent`}
              >
                AdminPortal
              </h1>
              <p className="text-xs text-gray-500">
                Welcome, {user?.name?.split(" ")[0]}
              </p>
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-1 bg-gray-50 rounded-xl p-1.5 shadow-inner border border-gray-200">
            {adminTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm ${
                    isActive
                      ? `text-${PRIMARY_TW_COLOR}-700 shadow-md bg-white ring-2 ring-${PRIMARY_TW_COLOR}-100`
                      : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? `text-${PRIMARY_TW_COLOR}-600` : ""
                    }`}
                  />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center space-x-3 lg:space-x-4">
            <div className="hidden md:block relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events, users..."
                className={`pl-10 pr-4 py-2.5 border border-gray-200 rounded-full focus:ring-2 focus:ring-offset-1 focus:ring-${PRIMARY_TW_COLOR}-300 focus:border-transparent w-48 lg:w-64 transition-all duration-200 text-sm bg-white`}
              />
            </div>

            <button
              className={`relative p-2.5 rounded-full hover:bg-gray-100 transition-all duration-200 group border border-transparent hover:border-gray-200`}
            >
              <Bell
                className={`w-5 h-5 text-gray-600 group-hover:text-${PRIMARY_TW_COLOR}-600 transition-colors`}
              />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            </button>

            <div className="flex items-center space-x-3">
              <div className="hidden md:flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl px-4 py-2 border border-purple-100">
                <div
                  className={`w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-br from-${PRIMARY_TW_COLOR}-600 to-${ACCENT_TW_COLOR}-500 rounded-full flex items-center justify-center shadow-md`}
                >
                  <span className="text-white text-sm font-semibold">
                    {user?.name?.charAt(0) || "A"}
                  </span>
                </div>
                <div className="hidden lg:block text-sm">
                  <p className="font-semibold text-gray-800 leading-tight">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="hidden sm:block p-2.5 rounded-full hover:bg-red-50 text-red-600 transition-all duration-200 hover:shadow-md border border-transparent hover:border-red-200"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-full hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-700" />
              ) : (
                <Menu className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 bg-white/95 backdrop-blur-sm">
            <div className="space-y-2">
              {adminTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive
                        ? `bg-gradient-to-r from-${PRIMARY_TW_COLOR}-50 to-${ACCENT_TW_COLOR}-50 text-${PRIMARY_TW_COLOR}-700 border border-${PRIMARY_TW_COLOR}-200 shadow-sm`
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.name}</span>
                    {isActive && (
                      <ArrowRight className="w-4 h-4 ml-auto text-purple-600" />
                    )}
                  </button>
                );
              })}

              <button
                onClick={onLogout}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all duration-200 border-t border-gray-200 mt-2 pt-4"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

const TabContentWrapper = ({ title, children, icon: Icon }) => (
  <div className="min-h-[70vh] bg-white rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100">
    <div className="flex items-center space-x-3 mb-6 border-b pb-4 border-gray-100">
      {Icon && <Icon className={`w-7 h-7 text-${PRIMARY_TW_COLOR}-600`} />}
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
    </div>
    <div className="space-y-6">{children}</div>
  </div>
);

// Dashboard Overview Component
const DashboardOverview = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalUsers: 0,
    totalAlumni: 0,
    totalStudents: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch events stats
      const eventsResponse = await axios.get(`${API_URL}/events/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch users
      const usersResponse = await axios.get(`${API_URL}/auth/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const users = usersResponse.data.users || [];

      setStats({
        totalEvents: eventsResponse.data.stats.totalEvents,
        totalUsers: users.length,
        totalAlumni: users.filter((u) => u.role === "alumni").length,
        totalStudents: users.filter((u) => u.role === "student").length,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Create Event",
      description: "Add a new event to the platform",
      icon: CalendarPlus,
      gradient: "from-purple-500 to-indigo-600",
      action: () => onNavigate("events"),
    },
    {
      title: "Manage Users",
      description: "View and manage all users",
      icon: UserPlus,
      gradient: "from-blue-500 to-blue-600",
      action: () => onNavigate("users"),
    },
    {
      title: "View Analytics",
      description: "Check platform statistics",
      icon: BarChart3,
      gradient: "from-green-500 to-emerald-600",
      action: () => onNavigate("analytics"),
    },
    {
      title: "Messages",
      description: "Manage communications",
      icon: MessageSquare,
      gradient: "from-orange-500 to-red-500",
      action: () => onNavigate("messages"),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-bold mb-3">
            Welcome to Admin Portal! 👋
          </h1>
          <p className="text-blue-100 text-lg">
            Manage your platform efficiently from one place
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Total Events</h3>
              <p className="text-4xl font-bold">
                {loading ? "..." : stats.totalEvents}
              </p>
              <p className="text-white/80 text-sm mt-2">Platform events</p>
            </div>
            <Calendar className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-4xl font-bold">
                {loading ? "..." : stats.totalUsers}
              </p>
              <p className="text-white/80 text-sm mt-2">Registered users</p>
            </div>
            <Users className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Alumni</h3>
              <p className="text-4xl font-bold">
                {loading ? "..." : stats.totalAlumni}
              </p>
              <p className="text-white/80 text-sm mt-2">Active alumni</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl p-6 text-white shadow-lg transform hover:scale-105 transition-transform">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Students</h3>
              <p className="text-4xl font-bold">
                {loading ? "..." : stats.totalStudents}
              </p>
              <p className="text-white/80 text-sm mt-2">Current students</p>
            </div>
            <Users className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className={`bg-gradient-to-r ${action.gradient} rounded-xl p-6 text-white hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-left`}
              >
                <Icon className="w-10 h-10 mb-4 opacity-90" />
                <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                <p className="text-white/90 text-sm">{action.description}</p>
                <ArrowRight className="w-5 h-5 mt-4 opacity-75" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">New event created</p>
              <p className="text-sm text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">New user registered</p>
              <p className="text-sm text-gray-500">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">New message received</p>
              <p className="text-sm text-gray-500">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// EVENTS MANAGEMENT (Your existing code - keeping it intact)
const EventsManagement = () => {
  const [events, setEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    time: "",
    type: "Workshop",
    maxAttendees: "",
    description: "",
    location: "",
    duration: "",
    organizer: "",
  });
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [eventStats, setEventStats] = useState([
    {
      id: "total",
      name: "Total Events",
      value: "0",
      change: "Loading...",
      trend: "up",
      icon: Calendar,
      gradient: "from-purple-400 to-purple-600",
    },
    {
      id: "upcoming",
      name: "Upcoming Events",
      value: "0",
      change: "Loading...",
      trend: "up",
      icon: TrendingUp,
      gradient: "from-blue-400 to-blue-600",
    },
    {
      id: "attendees",
      name: "Total Attendees",
      value: "0",
      change: "Loading...",
      trend: "up",
      icon: Users,
      gradient: "from-green-400 to-green-600",
    },
    {
      id: "capacity",
      name: "Avg. Capacity",
      value: "0%",
      change: "Loading...",
      trend: "up",
      icon: BarChart3,
      gradient: "from-orange-400 to-orange-600",
    },
  ]);

  const eventTypes = [
    "Workshop",
    "Networking",
    "Seminar",
    "Conference",
    "Webinar",
    "Social",
    "Career Fair",
  ];

  useEffect(() => {
    fetchEvents();
    fetchEventStats();
  }, [filters, searchTerm]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();

      if (filters.type !== "all") params.append("type", filters.type);
      if (filters.status !== "all") params.append("status", filters.status);
      if (searchTerm) params.append("search", searchTerm);

      const response = await axios.get(
        `${API_URL}/events?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Fetched events:", response.data);
      setEvents(response.data.events || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      alert(error.response?.data?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const fetchEventStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/events/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const stats = response.data.stats;
      console.log("Fetched stats:", stats);

      setEventStats([
        {
          id: "total",
          name: "Total Events",
          value: stats.totalEvents.toString(),
          change: `+${stats.totalEvents} total`,
          trend: "up",
          icon: Calendar,
          gradient: "from-purple-400 to-purple-600",
        },
        {
          id: "upcoming",
          name: "Upcoming Events",
          value: stats.upcomingEvents.toString(),
          change: `${stats.upcomingEvents} scheduled`,
          trend: "up",
          icon: TrendingUp,
          gradient: "from-blue-400 to-blue-600",
        },
        {
          id: "attendees",
          name: "Total Attendees",
          value: stats.totalAttendees.toString(),
          change: "Across all events",
          trend: "up",
          icon: Users,
          gradient: "from-green-400 to-green-600",
        },
        {
          id: "capacity",
          name: "Avg. Capacity",
          value: stats.avgCapacity,
          change: "Average filled",
          trend: "up",
          icon: BarChart3,
          gradient: "from-orange-400 to-orange-600",
        },
      ]);
    } catch (error) {
      console.error("Error fetching event stats:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEventForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateEvent = () => {
    setEventForm({
      title: "",
      date: "",
      time: "",
      type: "Workshop",
      maxAttendees: "",
      description: "",
      location: "",
      duration: "",
      organizer: "",
    });
    setEditingEvent(null);
    setShowEventForm(true);
  };

  const handleEditEvent = (event) => {
    const formattedDate = new Date(event.date).toISOString().split("T")[0];

    setEventForm({
      title: event.title,
      date: formattedDate,
      time: event.time,
      type: event.type,
      maxAttendees: event.maxAttendees.toString(),
      description: event.description,
      location: event.location,
      duration: event.duration,
      organizer: event.organizer,
    });
    setEditingEvent(event._id);
    setShowEventForm(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      fetchEvents();
      fetchEventStats();
      alert("Event deleted successfully!");
    } catch (error) {
      console.error("Error deleting event:", error);
      alert(error.response?.data?.message || "Failed to delete event");
    }
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const eventData = {
        ...eventForm,
        maxAttendees: parseInt(eventForm.maxAttendees),
      };

      console.log("Submitting event data:", eventData);

      if (editingEvent) {
        await axios.put(`${API_URL}/events/${editingEvent}`, eventData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Event updated successfully!");
      } else {
        await axios.post(`${API_URL}/events`, eventData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Event created successfully!");
      }

      setShowEventForm(false);
      setEditingEvent(null);
      fetchEvents();
      fetchEventStats();
    } catch (error) {
      console.error("Error saving event:", error);
      console.error("Error response:", error.response?.data);
      alert(
        error.response?.data?.message ||
          "Failed to save event. Please check all required fields."
      );
    }
  };

  const getCurrentAttendees = (event) => {
    if (!event.attendees) return 0;
    return event.attendees.filter((a) => a.status === "registered").length;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredEvents = events.filter((event) => {
    const matchesType = filters.type === "all" || event.type === filters.type;
    const matchesStatus =
      filters.status === "all" || event.status === filters.status;
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 pt-2">
        {eventStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className={`bg-gradient-to-r ${stat.gradient} rounded-xl p-6 text-white shadow-lg transform hover:scale-[1.02] transition-transform duration-200`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{stat.name}</h3>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-white/80 text-sm">{stat.change}</p>
                </div>
                <Icon className="w-9 h-9 opacity-80" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex flex-col lg:flex-row gap-4 flex-1 w-full">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search events..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <select
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={filters.type}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, type: e.target.value }))
                }
              >
                <option value="all">All Types</option>
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <select
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 w-full lg:w-auto">
            <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-semibold">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={handleCreateEvent}
              className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
            >
              <Plus className="w-5 h-5" />
              <span>Create Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
        </div>
      )}

      {/* Events List */}
      {!loading && (
        <div className="space-y-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">
                No events found matching your criteria.
              </p>
              <button
                onClick={handleCreateEvent}
                className="mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
              >
                Create Your First Event
              </button>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div
                key={event._id}
                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {event.title}
                  </h3>
                  <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full">
                    {event.type}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {event.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                    <span className="font-medium">
                      {formatDate(event.date)}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="font-medium">Time: {event.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-red-500" />
                    <span className="font-medium">
                      Location: {event.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-2 text-green-500" />
                      <span>
                        Registered: {getCurrentAttendees(event)} /{" "}
                        {event.maxAttendees}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      event.status === "upcoming"
                        ? "bg-green-100 text-green-800"
                        : event.status === "completed"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {event.status}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditEvent(event)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="Edit Event"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      title="Delete Event"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 lg:p-8">
              <h2 className="text-2xl lg:text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {editingEvent ? "Edit Event" : "Create New Event"}
              </h2>

              <form onSubmit={handleSubmitEvent} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      value={eventForm.title}
                      onChange={handleInputChange}
                      placeholder="Enter event title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Event Type *
                    </label>
                    <select
                      name="type"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      value={eventForm.type}
                      onChange={handleInputChange}
                    >
                      {eventTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      value={eventForm.date}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Time *
                    </label>
                    <input
                      type="time"
                      name="time"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      value={eventForm.time}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      value={eventForm.location}
                      onChange={handleInputChange}
                      placeholder="Enter event location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Max Attendees *
                    </label>
                    <input
                      type="number"
                      name="maxAttendees"
                      required
                      min="1"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      value={eventForm.maxAttendees}
                      onChange={handleInputChange}
                      placeholder="Enter maximum attendees"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    required
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    value={eventForm.description}
                    onChange={handleInputChange}
                    placeholder="Describe your event..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Duration *
                    </label>
                    <input
                      type="text"
                      name="duration"
                      required
                      placeholder="e.g., 2 hours"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      value={eventForm.duration}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Organizer *
                    </label>
                    <input
                      type="text"
                      name="organizer"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      value={eventForm.organizer}
                      onChange={handleInputChange}
                      placeholder="Event organizer"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEventForm(false)}
                    className="px-8 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-semibold"
                  >
                    {editingEvent ? "Update Event" : "Create Event"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main AdminDashboard Component
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, logout } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <TabContentWrapper title="Admin Dashboard Overview" icon={Activity}>
            <DashboardOverview onNavigate={setActiveTab} />
          </TabContentWrapper>
        );
      case "events":
        return (
          <TabContentWrapper title="Event Management Center" icon={Calendar}>
            <EventsManagement />
          </TabContentWrapper>
        );
      case "users":
        return (
          <TabContentWrapper title="Users Management" icon={Users}>
            <UsersManagement />
          </TabContentWrapper>
        );
      case "messages":
        return (
          <TabContentWrapper title="Messages" icon={MessageSquare}>
            <MessagingPage embedded={true} />
          </TabContentWrapper>
        );
      case "analytics":
        return (
          <TabContentWrapper title="Analytics Dashboard" icon={BarChart3}>
            <AnalyticsDashboard />
          </TabContentWrapper>
        );
      case "settings":
        return (
          <TabContentWrapper title="Settings" icon={Settings}>
            <div className="text-center py-12">
              <Settings className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">
                Settings panel coming soon...
              </p>
            </div>
          </TabContentWrapper>
        );
      default:
        return (
          <TabContentWrapper title="Admin Dashboard">
            <div className="text-center py-12">
              <p className="text-gray-600">
                Select a tab to manage different sections
              </p>
            </div>
          </TabContentWrapper>
        );
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 via-${PRIMARY_TW_COLOR}-50/30 to-${ACCENT_TW_COLOR}-50/30`}
    >
      <AdminNavbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={logout}
        user={user}
      />

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {renderContent()}
      </div>

      <Chatbot />
    </div>
  );
};

export default AdminDashboard;
