// src/components/Sidebar.jsx
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Button,
  Tooltip,
  Avatar,
  useColorModeValue,
  Divider,
  Flex,
} from "@chakra-ui/react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiPlus,
  FiBarChart2,
  FiUsers,
  FiUser,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiRepeat,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useBlockchain } from "../hooks/useBlockchain";


const MotionBox = motion(Box);

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: FiHome },
  { to: "/add-expense", label: "Add Expense", icon: FiPlus },
  { to: "/analytics", label: "Analytics", icon: FiBarChart2 },
  { to: "/groups", label: "Groups", icon: FiUsers },
  { to: "/my-groups", label: "My Groups", icon: FiUser },
  { to: "/settings", label: "Settings", icon: FiSettings },
];

export default function Sidebar() {
  const { currentUser, logout } = useAuth();
  const { account, isConnected, balance } = useBlockchain();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem("bb_sidebar_collapsed") === "1";
    } catch {
      return false;
    }
  });

  const bg = useColorModeValue("white", "gray.900");
  const accent = useColorModeValue("blue.600", "blue.300");
  const textColor = useColorModeValue("gray.700", "gray.200");

  // nav container ref and per-item refs
  const navRef = useRef(null);
  const itemNodesRef = useRef([]); // array of DOM nodes for items

  // animated indicator state
  const [indicator, setIndicator] = useState({
    top: 0,
    height: 0,
    visible: false,
  });

  // keep refs array in sync with items
  const setItemNode = (el, idx) => {
    itemNodesRef.current[idx] = el;
  };

  // persist collapse in localStorage and notify layout
  useEffect(() => {
    localStorage.setItem("bb_sidebar_collapsed", collapsed ? "1" : "0");
    window.dispatchEvent(new Event("bb_sidebar_toggle"));
  }, [collapsed]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  // compute active index from current pathname
  const activeIndex = useMemo(() => {
    const idx = navItems.findIndex((n) => n.to === location.pathname);
    return idx >= 0 ? idx : 0;
  }, [location.pathname]);

  // update indicator position/height when activeIndex / collapsed / window resize changes
  useEffect(() => {
    function updateIndicator() {
      const navNode = navRef.current;
      const itemNode = itemNodesRef.current[activeIndex];

      if (!navNode || !itemNode) {
        setIndicator((p) => ({ ...p, visible: false }));
        return;
      }

      // compute top relative to nav container
      const navRect = navNode.getBoundingClientRect();
      const itemRect = itemNode.getBoundingClientRect();
      const top = itemRect.top - navRect.top;
      const height = itemRect.height;

      setIndicator({ top, height, visible: true });
    }

    updateIndicator();

    // update on resize (sidebar width/collapse or font changes)
    window.addEventListener("resize", updateIndicator);
    // also update after a short delay to capture DOM changes
    const t = setTimeout(updateIndicator, 120);

    return () => {
      window.removeEventListener("resize", updateIndicator);
      clearTimeout(t);
    };
  }, [activeIndex, collapsed]);

  // small item appear animation variants (kept simple)
  const itemVariants = {
    hidden: { opacity: 0, x: -8 },
    show: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: 0.02 * i },
    }),
  };

  return (
    <MotionBox
      as="aside"
      bg={bg}
      borderRight="1px"
      borderColor={useColorModeValue("gray.200", "gray.800")}
      minH="100vh"
      position="fixed"
      left={0}
      top={0}
      zIndex={40}
      boxShadow="sm"
      animate={collapsed ? { width: 80 } : { width: 250 }}
      initial={false}
      transition={{ type: "spring", stiffness: 250, damping: 30 }}
    >
      <Flex direction="column" h="100%">
        {/* Brand Section */}
        <HStack px={4} py={5} justify={collapsed ? "center" : "space-between"} align="center">
          <HStack spacing={3}>
            <Avatar size="sm" name={currentUser?.email ?? "User"} />
            {!collapsed && (
              <Box>
                <Text fontWeight="bold" color={textColor}>
                  BudgetBuddy
                </Text>
                <Text fontSize="xs" color="gray.500">
                  {currentUser?.email ?? ""}
                </Text>
              </Box>
            )}
          </HStack>

          <IconButton
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            icon={collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            size="sm"
            variant="ghost"
            onClick={() => setCollapsed((s) => !s)}
          />
        </HStack>

        <Divider />

        {/* Navigation List (relative container for the sliding indicator) */}
        <VStack
          as="nav"
          align="stretch"
          spacing={1}
          mt={3}
          px={2}
          position="relative"
          ref={navRef}
        >
          {/* Animated sliding indicator (single element) */}
          {indicator.visible && (
            <MotionBox
              layout
              style={{ position: "absolute", left: collapsed ? 18 : 6 }}
              // animate top/height (we set top as px value)
              animate={{ top: indicator.top, height: indicator.height }}
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              width="4px"
              borderRadius="md"
              bg={useColorModeValue("blue.500", "blue.300")}
              boxShadow="0 0 8px rgba(66,153,225,0.6)"
            />
          )}

          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <MotionBox
                key={item.to}
                custom={idx}
                variants={itemVariants}
                initial="hidden"
                animate="show"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                position="relative"
                // store the DOM node for this item so we can measure it
                ref={(el) => setItemNode(el, idx)}
              >
                <Tooltip label={collapsed ? item.label : ""} placement="right" openDelay={300}>
                  <Button
                    as={NavLink}
                    to={item.to}
                    justifyContent={collapsed ? "center" : "flex-start"}
                    leftIcon={<Icon />}
                    variant="ghost"
                    w="100%"
                    h="44px"
                    color={isActive ? accent : undefined}
                    _hover={{
                      bg: useColorModeValue("gray.100", "gray.700"),
                      transform: "translateX(3px)",
                    }}
                    _activeLink={{
                      bg: useColorModeValue("blue.50", "blue.900"),
                    }}
                    sx={{
                      "&.active": {
                        background: `linear-gradient(90deg, ${useColorModeValue(
                          "#ebf8ff",
                          "#16325b"
                        )}, transparent)`,
                      },
                    }}
                  >
                    {!collapsed && (
                      <Text ml={2} textAlign="left" fontSize="sm" color={isActive ? accent : "inherit"}>
                        {item.label}
                      </Text>
                    )}
                  </Button>
                </Tooltip>
              </MotionBox>
            );
          })}
        </VStack>

        <Box flex="1" />

        {/* Wallet Info */}
        <Box px={3} pb={4}>
          <Divider mb={3} />
          <HStack spacing={3} align="center" justify={collapsed ? "center" : "space-between"}>
            <HStack spacing={3}>
              <Box
                width="10px"
                height="10px"
                borderRadius="full"
                bg={isConnected ? "green.400" : "gray.400"}
                boxShadow={isConnected ? "0 0 8px rgba(72,187,120,0.25)" : undefined}
              />
              {!collapsed && (
                <Box>
                  <Text fontSize="sm" fontWeight="semibold">
                    {isConnected ? "Connected" : "Not connected"}
                  </Text>
                  <Text fontSize="xs" color="gray.500" noOfLines={1}>
                    {isConnected ? (account ?? "").slice(0, 12) + "..." : "Connect wallet"}
                  </Text>
                </Box>
              )}
            </HStack>

            {!collapsed ? (
              <Button size="sm" variant="ghost">
                {isConnected ? Number(balance || 0).toFixed(4) + " ETH" : "Connect"}
              </Button>
            ) : (
              <Tooltip
                label={isConnected ? `${Number(balance || 0).toFixed(4)} ETH` : "Not connected"}
                placement="right"
              >
                <Box />
              </Tooltip>
            )}
          </HStack>

          {/* Bottom Utility Buttons — styled to match vibe */}
          <HStack mt={4} spacing={2} justify={collapsed ? "center" : "space-between"}>
            {!collapsed ? (
              <>
                <Button
                  size="sm"
                  leftIcon={<FiRepeat />}
                  bg={useColorModeValue("gray.800", "whiteAlpha.100")}
                  color={useColorModeValue("white", "gray.200")}
                  _hover={{
                    transform: "translateY(-2px)",
                    bg: useColorModeValue("gray.700", "whiteAlpha.200"),
                  }}
                  borderRadius="md"
                  onClick={() => window.location.reload()}
                >
                  Refresh
                </Button>

                <Button
                  size="sm"
                  leftIcon={<FiLogOut />}
                  borderColor={useColorModeValue("red.300", "red.600")}
                  color={useColorModeValue("red.600", "red.200")}
                  variant="outline"
                  _hover={{
                    bg: useColorModeValue("red.50", "red.900"),
                    transform: "translateY(-2px)",
                  }}
                  borderRadius="md"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <VStack>
                <Tooltip label="Refresh" placement="right">
                  <IconButton
                    aria-label="refresh"
                    icon={<FiRepeat />}
                    size="sm"
                    variant="ghost"
                    onClick={() => window.location.reload()}
                  />
                </Tooltip>
                <Tooltip label="Logout" placement="right">
                  <IconButton
                    aria-label="logout"
                    icon={<FiLogOut />}
                    size="sm"
                    variant="ghost"
                    onClick={handleLogout}
                  />
                </Tooltip>
              </VStack>
            )}
          </HStack>
        </Box>
      </Flex>
    </MotionBox>
  );
}
