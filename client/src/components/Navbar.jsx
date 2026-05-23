import React from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  IconButton,
  useColorModeValue,
  Badge,
  Alert,
  AlertIcon,
  AlertDescription,
  CloseButton
} from "@chakra-ui/react";
import { FiSun, FiMoon, FiUser, FiLogOut } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useBlockchain } from "../hooks/useBlockchain";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  
  const { 
    account, 
    isConnected, 
    connectWallet, 
    disconnectWallet,
    error,
    loading
  } = useBlockchain();

  const handleWalletConnect = async () => {
    if (isConnected) {
      disconnectWallet();
    } else {
      await connectWallet();
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return "";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  };

  const handleLogout = () => {
    logout();
    disconnectWallet();
    navigate("/login");
  };

  return (
    // <Box
    //   bg={bgColor}
    //   borderBottomWidth="1px"
    //   borderBottomColor={borderColor}
    //   position="sticky"
    //   top={0}
    //   zIndex={100}
    //   px={6}
    //   py={3}
    //   ml={{ md: "250px" }}
    //   width={{ md: "calc(100% - 250px)" }}
    // >
    <Box p={6}>
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          <AlertDescription flex="1">{error}</AlertDescription>
          <CloseButton position="absolute" right="8px" top="8px" />
        </Alert>
      )}
      
      <Flex justify="space-between" align="center">
        <Text fontSize="xl" fontWeight="bold">
          BudgetBuddy
        </Text>

        <Flex align="center" gap={4}>
          <IconButton
            icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
            aria-label="Toggle color mode"
            onClick={toggleColorMode}
            variant="ghost"
          />

          <Button
            onClick={handleWalletConnect}
            colorScheme={isConnected ? "green" : "blue"}
            variant={isConnected ? "outline" : "solid"}
            size="sm"
            isLoading={loading}
            loadingText="Connecting..."
          >
            {isConnected ? `Wallet: ${formatAddress(account)}` : "Connect Wallet"}
          </Button>

          {isConnected && (
            <Badge colorScheme="green" variant="solid">
              Connected
            </Badge>
          )}

          {currentUser && (
            <Menu>
              <MenuButton>
                <Avatar size="sm" name={currentUser.email} />
              </MenuButton>
              <MenuList>
                <MenuItem icon={<FiUser />}>
                  {currentUser.email}
                </MenuItem>
                <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;