import React from "react";
import { 
  Box, 
  Container, 
  Heading, 
  Text, 
  Button, 
  Flex, 
  VStack, 
  useColorModeValue,
  HStack,
  Icon,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FiArrowRight, 
  FiShield, 
  FiPieChart, 
  FiUsers, 
  FiDollarSign,
  FiTrendingUp,
  FiCheck
} from "react-icons/fi";

const MotionBox = motion(Box);
const MotionCard = motion(Card);

const Home = () => {
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const textColor = useColorModeValue("gray.600", "gray.300");
  const cardBg = useColorModeValue("white", "gray.800");

  const features = [
    {
      title: "Decentralized",
      description: "Built on Ethereum blockchain for transparency and security",
      icon: FiShield,
      color: "blue"
    },
    {
      title: "Easy Splitting",
      description: "Split expenses with friends and groups effortlessly",
      icon: FiUsers,
      color: "green"
    },
    {
      title: "Real-time Analytics",
      description: "Track spending patterns with beautiful visualizations",
      icon: FiPieChart,
      color: "purple"
    }
  ];

  const stats = [
    { value: "5,000+", label: "Active Users" },
    { value: "₹1.2M+", label: "Expenses Tracked" },
    { value: "200+", label: "Groups Created" },
    { value: "99.9%", label: "Uptime" }
  ];

  return (
    <Box bg={bgColor} minH="100vh" position="relative" overflow="hidden">
      {/* Animated background elements */}
      <Box
        position="absolute"
        top="-10%"
        right="-10%"
        w="600px"
        h="600px"
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
        w="500px"
        h="500px"
        borderRadius="full"
        bgGradient="linear(to-tr, teal.100, cyan.100)"
        _dark={{ bgGradient: "linear(to-tr, teal.900, cyan.900)" }}
        opacity="0.3"
        filter="blur(40px)"
        zIndex="0"
      />
      
      <Container maxW="container.xl" py={20} position="relative" zIndex="1">
        <Flex direction={{ base: "column", md: "row" }} align="center" justify="space-between" mb={20}>
          <VStack 
            align="flex-start" 
            spacing={6} 
            maxW={{ base: "100%", md: "50%" }}
          >
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge colorScheme="blue" variant="solid" borderRadius="full" px={3} py={1} mb={4}>
                Blockchain Powered
              </Badge>
              <Heading as="h1" size="2xl" fontWeight="bold" lineHeight="1.2">
                Welcome to{" "}
                <Box as="span" bgGradient="linear(to-r, blue.500, purple.500)" bgClip="text">
                  BudgetBuddy
                </Box>
              </Heading>
            </MotionBox>
            
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Text fontSize="xl" color={textColor}>
                A decentralized and secure blockchain ecosystem for multi-user expense sharing using Ethereum.
                Track expenses, split bills, and manage group finances with complete transparency.
              </Text>
            </MotionBox>
            
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button as={Link} to="/signup" colorScheme="blue" size="lg" rightIcon={<FiArrowRight />}>
                    Get Started
                  </Button>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button as={Link} to="/login" variant="outline" size="lg">
                    Login
                  </Button>
                </motion.div>
              </Flex>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6} mt={6}>
                {stats.map((stat, index) => (
                  <Stat key={index} textAlign="center">
                    <StatNumber fontSize="xl" fontWeight="bold" color={useColorModeValue("gray.800", "white")}>
                      {stat.value}
                    </StatNumber>
                    <StatLabel fontSize="sm" color={textColor}>{stat.label}</StatLabel>
                  </Stat>
                ))}
              </SimpleGrid>
            </MotionBox>
          </VStack>
          
          <MotionBox
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ maxWidth: "100%", width: "45%", marginTop: "40px" }}
          >
            <Card bg={cardBg} borderRadius="2xl" overflow="hidden" boxShadow="xl">
              <CardBody p={0}>
                <Box 
                  bgGradient="linear(to-r, blue.500, purple.500)" 
                  height="200px" 
                  display="flex" 
                  alignItems="center" 
                  justifyContent="center"
                >
                  <FiDollarSign size={60} color="white" />
                </Box>
                <Box p={6}>
                  <Heading size="md" mb={2}>Blockchain Expense Tracking</Heading>
                  <Text color={textColor} mb={4}>
                    Experience the future of financial management with decentralized expense tracking
                  </Text>
                  <HStack spacing={3}>
                    <Badge colorScheme="green" borderRadius="full" px={2}>
                      <FiCheck size={12} /> Secure
                    </Badge>
                    <Badge colorScheme="purple" borderRadius="full" px={2}>
                      <FiCheck size={12} /> Transparent
                    </Badge>
                    <Badge colorScheme="blue" borderRadius="full" px={2}>
                      <FiCheck size={12} /> Efficient
                    </Badge>
                  </HStack>
                </Box>
              </CardBody>
            </Card>
          </MotionBox>
        </Flex>
        
        <Box mt={20}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            textAlign="center"
            mb={12}
          >
            <Heading as="h2" size="xl" mb={4}>
              Why Choose BudgetBuddy?
            </Heading>
            <Text fontSize="lg" color={textColor} maxW="2xl" mx="auto">
              Discover the features that make BudgetBuddy the perfect choice for managing your expenses
            </Text>
          </MotionBox>
          
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            {features.map((feature, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -5 }}
              >
                <Card 
                  bg={cardBg} 
                  height="100%" 
                  borderRadius="xl"
                  overflow="hidden"
                  boxShadow="md"
                  _hover={{ boxShadow: "xl" }}
                  transition="all 0.3s"
                >
                  <CardBody textAlign="center" p={6}>
                    <Flex
                      justify="center"
                      align="center"
                      w={12}
                      h={12}
                      bg={`${feature.color}.100`}
                      color={`${feature.color}.600`}
                      borderRadius="xl"
                      mx="auto"
                      mb={4}
                    >
                      <Icon as={feature.icon} boxSize={6} />
                    </Flex>
                    <Heading as="h3" size="md" mb={2}>{feature.title}</Heading>
                    <Text color={textColor}>{feature.description}</Text>
                  </CardBody>
                </Card>
              </MotionBox>
            ))}
          </SimpleGrid>
        </Box>

        {/* CTA Section */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          mt={20}
          textAlign="center"
        >
          <Card bgGradient="linear(to-r, blue.500, purple.500)" color="white" borderRadius="2xl" overflow="hidden">
            <CardBody py={10} px={6}>
              <Heading as="h2" size="xl" mb={4}>
                Ready to Transform Your Expense Management?
              </Heading>
              <Text fontSize="lg" mb={6} opacity={0.9}>
                Join thousands of users who trust BudgetBuddy for transparent, secure, and efficient expense tracking
              </Text>
              <Button 
                as={Link} 
                to="/signup" 
                colorScheme="white" 
                variant="outline" 
                size="lg"
                rightIcon={<FiArrowRight />}
                _hover={{ bg: "white", color: "blue.500" }}
              >
                Get Started Free
              </Button>
            </CardBody>
          </Card>
        </MotionBox>
      </Container>
    </Box>
  );
};

export default Home;