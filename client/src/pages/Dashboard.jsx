import React, { useEffect } from "react";
import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardHeader,
  CardBody,
  useColorModeValue,
  Flex,
  Icon,
  VStack,
  HStack,
  Badge
} from "@chakra-ui/react";
import { FiDollarSign, FiUsers, FiTrendingUp, FiActivity } from "react-icons/fi";
import { motion } from "framer-motion";
import { useBlockchain } from "../hooks/useBlockchain";
import { ethers } from "ethers";

const MotionCard = motion(Card);

// --- helpers to safely handle mixed amount shapes ---
const toWei = (v) => {
  // already bigint (wei)
  if (typeof v === "bigint") return v;

  // ethers v5 BigNumber-like { _hex: '0x..' }
  if (v && typeof v === "object" && "_hex" in v) {
    try { return BigInt(v._hex); } catch { return 0n; }
  }

  // string: could be ETH ("0.1") or wei ("100000000000000000")
  if (typeof v === "string" && v.trim() !== "") {
    try { return ethers.parseEther(v); } catch { /* not an ETH float */ }
    try { return BigInt(v); } catch { /* not a bigint string */ }
    return 0n;
  }

  // numbers should be avoided for onchain amounts, but handle defensively
  if (typeof v === "number" && Number.isFinite(v)) {
    try { return ethers.parseEther(String(v)); } catch { return 0n; }
  }

  return 0n; // null/undefined/anything else
};

const Dashboard = () => {
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const { expenses, isConnected, account, fetchExpenses } = useBlockchain();

  useEffect(() => {
    if (isConnected) fetchExpenses();
  }, [isConnected, fetchExpenses]);

  // total in wei (bigint) across any expense shape:
  // prefer normalized fields from the hook: amount (wei bigint) OR amountWei / amountEth
  const totalWei = expenses.reduce((acc, e) => {
    const wei = toWei(e.amount ?? e.amountWei ?? e.amountEth ?? 0);
    return acc + wei;
  }, 0n);
  const totalEth = ethers.formatEther(totalWei);

  const stats = [
    {
      label: "Total Expenses",
      value: `Ξ ${Number(totalEth).toFixed(4)}`,
      icon: FiDollarSign,
      change: "+12%",
      changeType: "increase",
    },
    {
      label: "Transactions",
      value: String(expenses.length),
      icon: FiActivity,
      change: `+${expenses.length}`,
      changeType: "neutral",
    },
    {
      label: "Wallet Connected",
      value: isConnected ? "Yes" : "No",
      icon: FiUsers,
      change: isConnected ? "Connected" : "Disconnected",
      changeType: isConnected ? "increase" : "decrease",
    },
    {
      label: "Your Address",
      value: isConnected && account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Not connected",
      icon: FiTrendingUp,
      change: "",
      changeType: "neutral",
    },
  ];

  const displayEth = (e) => {
    // prefer preformatted string if provided by the hook
    if (typeof e.amountEth === "string" && e.amountEth.trim() !== "") {
      // trim for small UI badge
      return e.amountEth.slice(0, 6);
    }
    // otherwise, format whatever amount we have safely
    const wei = toWei(e.amount ?? e.amountWei ?? 0);
    return ethers.formatEther(wei).slice(0, 6);
  };

  return (
    <Box p={6}>
      <Heading as="h1" size="xl" mb={8} color={useColorModeValue("gray.700", "white")}>
        Dashboard
      </Heading>

      <Text fontSize="lg" mb={10} color={textColor}>
        {isConnected && account
          ? `Welcome back! Here's your financial overview. Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
          : "Connect your wallet to view blockchain expenses"}
      </Text>

      <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={6} mb={10}>
        {stats.map((stat, index) => (
          <GridItem key={index}>
            <MotionCard
              bg={cardBg}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
            >
              <CardBody>
                <Flex align="center">
                  <Box mr={4}>
                    <Icon as={stat.icon} w={8} h={8} color="blue.500" />
                  </Box>
                  <Stat>
                    <StatLabel color={textColor}>{stat.label}</StatLabel>
                    <StatNumber fontSize="2xl">{stat.value}</StatNumber>
                    <StatHelpText
                      color={
                        stat.changeType === "increase"
                          ? "green.500"
                          : stat.changeType === "decrease"
                          ? "red.500"
                          : "gray.500"
                      }
                    >
                      {stat.change}
                    </StatHelpText>
                  </Stat>
                </Flex>
              </CardBody>
            </MotionCard>
          </GridItem>
        ))}
      </Grid>

      <Grid templateColumns={{ base: "repeat(1, 1fr)", lg: "repeat(2, 1fr)" }} gap={6}>
        <GridItem>
          <MotionCard
            bg={cardBg}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CardHeader>
              <Heading size="md">Recent Blockchain Expenses</Heading>
            </CardHeader>
            <CardBody>
              {expenses.length === 0 ? (
                <Text color={textColor}>
                  {isConnected ? "No expenses found on blockchain" : "Connect wallet to view expenses"}
                </Text>
              ) : (
                <VStack spacing={3} align="stretch">
                  {expenses
                    .slice(-5)
                    .reverse()
                    .map((expense, index) => (
                      <Box key={index} p={3} borderWidth="1px" borderRadius="md">
                        <HStack justify="space-between">
                          <Text fontWeight="medium">{expense.description || "—"}</Text>
                          <Badge colorScheme="blue">Ξ {displayEth(expense)}</Badge>
                        </HStack>
                        <Text fontSize="sm" color={textColor}>
                          Paid by:{" "}
                          {expense.payer
                            ? `${expense.payer.slice(0, 6)}...${expense.payer.slice(-4)}`
                            : "unknown"}
                        </Text>
                      </Box>
                    ))}
                </VStack>
              )}
            </CardBody>
          </MotionCard>
        </GridItem>

        <GridItem>
          <MotionCard
            bg={cardBg}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <CardHeader>
              <Heading size="md">Quick Actions</Heading>
            </CardHeader>
            <CardBody>
              <Text color={textColor}>
                {isConnected
                  ? "Your wallet is connected and ready for transactions."
                  : "Connect your wallet to interact with the blockchain."}
              </Text>
            </CardBody>
          </MotionCard>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Dashboard;
