"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./Mode-toggle";
import { NotificationDropdown } from "./NotificationDropdown";
import Image from "next/image";

export default function Navbar() {
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAvatarOpen, setIsAvatarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const bellRef = useRef<HTMLButtonElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);

  const router = useRouter();

  useEffect(() => {
    // Watch login state every 300ms
    const interval = setInterval(() => {
      const loginStatus = localStorage.getItem("stackit_loggedIn") === "1";
      setIsLoggedIn(loginStatus);
    }, 300);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
    const res = await fetch("/api/notifications/me"); // GET for logged-in user
    const data = await res.json();
    setNotifications(data.notifications);
  };

    if (isLoggedIn) fetchNotifications();
  }, [isLoggedIn]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
  };

  const handleLogout = () => {
    localStorage.removeItem("stackit_loggedIn");
    setIsAvatarOpen(false);
    setIsLoggedIn(false); // instant state update
    router.push("/");     // go to home
  };

  return (
    <header className="relative z-50 dark:bg-slate-900 backdrop-blur">
      <div className="container mx-auto px-4 py-4 overflow-visible">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            StackIt
          </Link>

          <div className="flex items-center gap-4 relative z-50">
            {/* Search (mobile) */}
            <Button variant="ghost" size="icon" className="sm:hidden">
              <Search className="h-5 w-5" />
            </Button>

            {/* Notification Bell */}
            <div className="relative">
              <Button
                ref={bellRef}
                variant="ghost"
                size="icon"
                onClick={() => setIsNotifOpen((prev) => !prev)}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>

              <NotificationDropdown
                isOpen={isNotifOpen}
                onClose={() => setIsNotifOpen(false)}
                notifications={notifications}
                anchorRef={bellRef}
                onMarkAllAsRead={markAllAsRead}
              />
            </div>

            {/* Avatar / Login */}
            {isLoggedIn ? (
              <div className="relative z-[9999]">
                <Button
                  ref={avatarRef}
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsAvatarOpen((prev) => !prev)}
                  aria-label="User menu"
                >
                  <Image
                    src="/avatar.png"
                    alt="Avatar"
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                </Button>

                {isAvatarOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded shadow-lg z-[10000] border border-slate-200 dark:border-slate-700">
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                      <li>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                          onClick={() => {
                            setIsAvatarOpen(false);
                            router.push("/profile");
                          }}
                        >
                          Profile
                        </button>
                      </li>
                      <li>
                        <button
                          className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
                          onClick={handleLogout}
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}

            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
