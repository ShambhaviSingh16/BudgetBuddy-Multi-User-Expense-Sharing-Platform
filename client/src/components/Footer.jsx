import React from "react";
import { useTheme } from "../context/ThemeContext";
import { motion } from "framer-motion";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  const { darkMode } = useTheme();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={`mt-8 py-6 border-t ${
        darkMode ? "border-gray-700" : "border-gray-200"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-4 md:mb-0">
            <p className={`text-sm ${
              darkMode ? "text-gray-400" : "text-gray-600"
            }`}>
              © {new Date().getFullYear()} BudgetBuddy. All rights reserved.
            </p>
          </div>
          
          <div className="flex space-x-4">
            <motion.a
              whileHover={{ y: -2 }}
              href="https://github.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-full ${
                darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
              }`}
            >
              <FaGithub className="w-5 h-5" />
            </motion.a>
            
            <motion.a
              whileHover={{ y: -2 }}
              href="https://twitter.com/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-full ${
                darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
              }`}
            >
              <FaTwitter className="w-5 h-5" />
            </motion.a>
            
            <motion.a
              whileHover={{ y: -2 }}
              href="https://linkedin.com/in/yourusername"
              target="_blank"
              rel="noopener noreferrer"
              className={`p-2 rounded-full ${
                darkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-700"
              }`}
            >
              <FaLinkedin className="w-5 h-5" />
            </motion.a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;