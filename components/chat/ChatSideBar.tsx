"use client";

import { useState, useEffect, useRef } from "react";
import ChatHistory from "@/components/chat/ChatHistory";
import { MenuIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import Login from "@/components/input/login";

const SidebarWrapper = ({ user }: { user: any }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      sidebarRef.current &&
      !sidebarRef.current.contains(event.target as Node)
    ) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (sidebarOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  const sidebarContent = (
    <div className="w-64 text-base-content flex flex-col justify-between bg-white shadow-lg h-full">
      <div>
        {user ? (
          <ChatHistory user={user} />
        ) : (
          <>
            <div className="mt-6 md:mt-0 p-4">
              <Logo />
            </div>
            <div className="p-4 flex flex-col items-center">
              <Login />
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="p-4 md:hidden fixed top-0 left-0 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="text-gray-500 focus:outline-none"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div ref={sidebarRef}>{sidebarContent}</div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="hidden md:flex md:relative">{sidebarContent}</div>
    </>
  );
};

export default SidebarWrapper;
