import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ChakraProvider, Flex, Spinner, extendTheme } from "@chakra-ui/react";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Layout from "./components/Layout";
import AddExpense from "./pages/AddExpense";
import Analytics from "./pages/Analytics";
import Groups from "./pages/Groups";
import MyGroups from "./pages/MyGroups";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import GlobalStyles from "./components/GlobalStyles";

// Extend Chakra UI theme
const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: "#eef2ff",
      100: "#e0e7ff",
      200: "#c7d2fe",
      300: "#a5b4fc",
      400: "#818cf8",
      500: "#6366f1",
      600: "#4f46e5",
      700: "#4338ca",
      800: "#3730a3",
      900: "#312e81",
    },
  },
  fonts: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
  },
  styles: {
    global: (props) => ({
      "html, body": {
        backgroundColor: props.colorMode === "dark" ? "gray.900" : "gray.50",
        transition: "background-color 0.2s",
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: "lg",
        fontWeight: "semibold",
      },
      variants: {
        solid: (props) => ({
          bg: props.colorMode === "dark" ? "brand.600" : "brand.500",
          color: "white",
          _hover: {
            bg: props.colorMode === "dark" ? "brand.500" : "brand.600",
            transform: "translateY(-1px)",
            boxShadow: "lg",
          },
          _active: {
            bg: props.colorMode === "dark" ? "brand.700" : "brand.700",
          },
        }),
      },
    },
    Card: {
      baseStyle: (props) => ({
        container: {
          backgroundColor: props.colorMode === "dark" ? "gray.800" : "white",
          borderRadius: "xl",
          boxShadow: props.colorMode === "dark" ? "dark-lg" : "md",
          transition: "all 0.2s",
          _hover: {
            boxShadow: props.colorMode === "dark" ? "dark-lg" : "lg",
          },
        },
      }),
    },
  },
});

const AppContent = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
      </Flex>
    );
  }

  return (
    <Router>
      <GlobalStyles />
      <Routes>
        <Route path="/" element={currentUser ? <Navigate to="/dashboard" /> : <Home />} />
        <Route path="/login" element={currentUser ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={currentUser ? <Navigate to="/dashboard" /> : <Signup />} />
        {/* Protected Routes */}
        <Route path="/dashboard" element={
          currentUser ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/add-expense" element={
          currentUser ? <Layout><AddExpense /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/analytics" element={
          currentUser ? <Layout><Analytics /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/groups" element={
          currentUser ? <Layout><Groups /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/my-groups" element={
          currentUser ? <Layout><MyGroups /></Layout> : <Navigate to="/login" />
        } />
        <Route path="/settings" element={
          currentUser ? <Layout><Settings /></Layout> : <Navigate to="/login" />
        } />
      </Routes>
    </Router>
  );
};

const App = () => {
  return (
    <ChakraProvider theme={theme}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ChakraProvider>
  );
};

export default App;