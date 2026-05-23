import React, { useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem("bb_sidebar_collapsed") === "1";
    } catch {
      return false;
    }
  });

  // Listen for sidebar toggle events
  useEffect(() => {
    const onToggle = () => {
      setSidebarCollapsed(localStorage.getItem("bb_sidebar_collapsed") === "1");
    };
    window.addEventListener("bb_sidebar_toggle", onToggle);
    window.addEventListener("storage", onToggle);
    return () => {
      window.removeEventListener("bb_sidebar_toggle", onToggle);
      window.removeEventListener("storage", onToggle);
    };
  }, []);

  const sidebarWidth = sidebarCollapsed ? 80 : 250;

  return (
    <Box minH="100vh" bg="gray.50" _dark={{ bg: "gray.900" }} position="relative" overflow="hidden">
      {/* Blurred animated background orbs */}
      <Box
        position="absolute"
        top="-10%"
        right="-10%"
        w="400px"
        h="400px"
        borderRadius="full"
        bgGradient="linear(to-br, blue.100, purple.100)"
        _dark={{ bgGradient: "linear(to-br, blue.900, purple.900)" }}
        opacity="0.3"
        filter="blur(40px)"
        zIndex="0"
      />
      <Box
        position="absolute"
        bottom="-10%"
        left="-10%"
        w="300px"
        h="300px"
        borderRadius="full"
        bgGradient="linear(to-tr, teal.100, cyan.100)"
        _dark={{ bgGradient: "linear(to-tr, teal.900, cyan.900)" }}
        opacity="0.3"
        filter="blur(40px)"
        zIndex="0"
      />

      <Sidebar />

      {/* Animated Main Content Area */}
      <MotionBox
        ml={`${sidebarWidth}px`}
        minH="100vh"
        position="relative"
        zIndex="1"
        transition={{
          duration: 0.35,
          ease: [0.4, 0.0, 0.2, 1],
        }}
      >
        <Navbar />
        <MotionBox
          p={6}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </MotionBox>
      </MotionBox>
    </Box>
  );
};

export default Layout;
