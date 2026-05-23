// src/pages/Analytics.jsx
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Card,
  CardBody,
  useColorModeValue,
  SimpleGrid,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  GridItem,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  Flex,
  Icon,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { FiPieChart, FiTrendingUp } from "react-icons/fi";
import { useBlockchain } from "../hooks/useBlockchain";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as CTooltip,
  Legend,
  ArcElement,
  Filler,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import { ethers } from "ethers";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  CTooltip,
  Legend,
  ArcElement,
  Filler
);

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const Analytics = () => {
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const smallText = useColorModeValue("gray.500", "gray.300");

  const [timeRange, setTimeRange] = useState("monthly");
  const { expenses, isConnected } = useBlockchain();

  // analytics state
  const [analyticsData, setAnalyticsData] = useState({
    totalSpent: 0,
    dailyAverage: 0,
    categoryBreakdown: [],
    trends: { labels: [], series: [] },
  });

  // refs to charts so we can create canvas gradients
  const lineChartRef = useRef(null);
  const pieChartRef = useRef(null);

  useEffect(() => {
    if (!expenses || expenses.length === 0) {
      setAnalyticsData({
        totalSpent: 0,
        dailyAverage: 0,
        categoryBreakdown: [],
        trends: { labels: [], series: [] },
      });
      return;
    }

    // 1) Total spent in ETH (safely handle BigInt/wei)
    const totalWei = expenses.reduce((sum, e) => {
      try {
        // prefer amountWei stored as BigInt string/BigInt
        const w = e.amountWei ? BigInt(e.amountWei) : BigInt(0);
        return sum + w;
      } catch {
        return sum;
      }
    }, 0n);

    const totalEth = Number(ethers.formatEther(totalWei));

    // 2) Daily average (simple heuristic)
    const dailyAvg = totalEth / 30;

    // 3) Category breakdown
    const catMap = {};
    expenses.forEach((e) => {
      const cat = e.category || "other";
      let amt = 0;
      try {
        amt = Number(e.amountEth ?? ethers.formatEther(e.amountWei ?? 0n));
      } catch {
        amt = Number(e.amount ?? 0);
      }
      catMap[cat] = (catMap[cat] || 0) + (isNaN(amt) ? 0 : amt);
    });
    const categoryBreakdown = Object.entries(catMap).map(([name, amount]) => ({
      name,
      amount,
      percentage: 0,
    }));
    const sumCats = categoryBreakdown.reduce((s, c) => s + c.amount, 0) || 1;
    categoryBreakdown.forEach((c) => (c.percentage = Math.round((c.amount / sumCats) * 100)));

    // 4) Trends (by day)
    const byDate = {};
    expenses.forEach((e) => {
      const ts = Number(e.timestamp ?? e.time ?? Date.now() / 1000);
      const d = new Date(ts * 1000);
      const label = d.toISOString().slice(0, 10); // yyyy-mm-dd
      const val = (() => {
        try {
          return Number(e.amountEth ?? ethers.formatEther(e.amountWei ?? 0n));
        } catch {
          return Number(e.amount ?? 0);
        }
      })();
      byDate[label] = (byDate[label] || 0) + (isNaN(val) ? 0 : val);
    });
    const sortedDates = Object.keys(byDate).sort();
    const labels = sortedDates;
    const series = sortedDates.map((d) => Number((byDate[d] || 0).toFixed(6)));

    setAnalyticsData({
      totalSpent: totalEth,
      dailyAverage: dailyAvg,
      categoryBreakdown,
      trends: { labels, series },
    });
  }, [expenses]);

  // Build line chart config & gradient after render
  const buildLineData = () => {
    const labels = analyticsData.trends.labels;
    const data = analyticsData.trends.series;

    // default colors (mode-aware)
    const strokeColor = useColorModeValue("#2563eb", "#60a5fa"); // blue 600 / blue 300
    const pointBg = useColorModeValue("#ffffff", "#0f1724");
    const fillTop = useColorModeValue("rgba(37,99,235,0.18)", "rgba(96,165,250,0.08)");
    const fillBottom = useColorModeValue("rgba(37,99,235,0.04)", "rgba(96,165,250,0.02)");

    // gradient for area
    let bgGradient = fillTop;
    try {
      const chart = lineChartRef.current?.chartInstance ?? lineChartRef.current;
      if (chart) {
        const ctx = chart.ctx ?? chart;
        const canvas = ctx.canvas ?? chart.canvas;
        const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
        g.addColorStop(0, fillTop);
        g.addColorStop(0.9, fillBottom);
        bgGradient = g;
      }
    } catch {
      // fallback
      bgGradient = fillTop;
    }

    return {
      labels,
      datasets: [
        {
          label: "Daily spending (ETH)",
          data,
          tension: 0.32,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: pointBg,
          pointBorderColor: strokeColor,
          pointBorderWidth: 2,
          borderColor: strokeColor,
          borderWidth: 2,
          fill: true,
          backgroundColor: bgGradient,
          // soft shadow via pluginless trick (lighter border + glow)
          // Chart.js doesn't support shadow natively — left minimal
        },
      ],
    };
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: useColorModeValue("white", "#0b1220"),
        titleColor: useColorModeValue("#1f2937", "#e6eef8"),
        bodyColor: useColorModeValue("#1f2937", "#cbd5e1"),
        borderColor: useColorModeValue("rgba(0,0,0,0.06)", "rgba(255,255,255,0.06)"),
        borderWidth: 1,
        callbacks: {
          label: (ctx) => ` Daily spending (ETH): ${Number(ctx.raw ?? 0).toFixed(6)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: useColorModeValue("rgba(0,0,0,0.04)", "rgba(255,255,255,0.03)"), drawBorder: false },
        ticks: { color: useColorModeValue("#374151", "#cbd5e1"), maxRotation: 0 },
      },
      y: {
        grid: { color: useColorModeValue("rgba(0,0,0,0.04)", "rgba(255,255,255,0.03)") },
        ticks: { color: useColorModeValue("#374151", "#cbd5e1") },
      },
    },
  };

  // PIE chart data (with a colorful palette)
  const buildPieData = () => {
    const labels = analyticsData.categoryBreakdown.map((c) => `${c.name} (${c.percentage}%)`);
    const values = analyticsData.categoryBreakdown.map((c) => Number(c.amount.toFixed(6)));
    // palette — friendly pastel + accessible picks; if many categories, colors will cycle
    const palette = [
      "#60a5fa",
      "#7dd3fc",
      "#34d399",
      "#f6c6b6",
      "#fca5a5",
      "#fbbf24",
      "#a78bfa",
      "#f472b6",
      "#93c5fd",
      "#94a3b8",
    ];
    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: palette.slice(0, values.length),
          borderWidth: 1,
          borderColor: useColorModeValue("#ffffff", "#0b1220"),
        },
      ],
    };
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: useColorModeValue("#374151", "#cbd5e1"),
          boxWidth: 12,
          padding: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const val = ctx.raw ?? 0;
            return `${ctx.label?.split(" (")[0] ?? ""}: Ξ ${Number(val).toFixed(6)}`;
          },
        },
      },
    },
  };

  // Budget goals helper (unchanged from your original logic)
  const budgetGoals = analyticsData.categoryBreakdown.map((c) => ({
    name: c.name,
    spent: c.amount,
    goal: Math.max(0.1, c.amount * 1.5),
  }));

  // Render: if disconnected show connect card (unchanged)
  if (!isConnected) {
    return (
      <Box p={6}>
        <Heading as="h1" size="xl" mb={8} color={useColorModeValue("gray.700", "white")}>
          Analytics
        </Heading>
        <MotionCard
          bg={cardBg}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          p={8}
          textAlign="center"
        >
          <Icon as={FiPieChart} boxSize={12} color={textColor} mb={4} opacity={0.5} />
          <Heading size="md" mb={2} color={textColor}>
            Connect Your Wallet
          </Heading>
          <Text color={textColor}>Please connect your wallet to view your expense analytics and insights.</Text>
        </MotionCard>
      </Box>
    );
  }

  // Use the build funcs to create data objects
  const lineData = buildLineData();
  const pieData = buildPieData();

  return (
    <Box p={6}>
      <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} mb={8}>
        <HStack justify="space-between" align="flex-end">
          <Box>
            <Heading as="h1" size="xl" mb={2} color={useColorModeValue("gray.700", "white")}>
              Analytics
            </Heading>
            <Text color={textColor}>Insights and trends from your spending habits</Text>
          </Box>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            width="auto"
            variant="filled"
            borderRadius="lg"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </Select>
        </HStack>
      </MotionBox>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={10}>
        <GridItem>
          <MotionCard bg={cardBg} p={6} minH="220px">
            <CardBody>
              <Flex align="center" mb={4}>
                <Icon as={FiPieChart} boxSize={5} mr={2} />
                <Heading size="md">Spending Overview</Heading>
              </Flex>
              <VStack spacing={4} align="stretch">
                {analyticsData.categoryBreakdown.length === 0 ? (
                  <Text color={smallText}>No categories yet</Text>
                ) : (
                  analyticsData.categoryBreakdown.map((category, i) => (
                    <Box key={i}>
                      <HStack justify="space-between" mb={1}>
                        <Text fontWeight="medium">{category.name}</Text>
                        <Text color={smallText}>Ξ {category.amount.toFixed(6)}</Text>
                      </HStack>
                      <HStack>
                        <Progress
                          value={category.percentage}
                          size="sm"
                          width="100%"
                          borderRadius="full"
                          hasStripe
                          isAnimated
                        />
                        <Text fontSize="sm" color={smallText} minW="40px">
                          {category.percentage}%
                        </Text>
                      </HStack>
                    </Box>
                  ))
                )}
              </VStack>
            </CardBody>
          </MotionCard>
        </GridItem>

        <GridItem>
          <MotionCard bg={cardBg} p={6} minH="220px">
            <CardBody>
              <Flex align="center" mb={4}>
                <Icon as={FiTrendingUp} boxSize={5} mr={2} />
                <Heading size="md">Financial Summary</Heading>
              </Flex>
              <VStack spacing={6} align="stretch">
                <Stat>
                  <StatLabel>Total Spent</StatLabel>
                  <StatNumber fontSize="2xl" fontWeight="bold">
                    Ξ {analyticsData.totalSpent.toFixed(6)}
                  </StatNumber>
                  <StatHelpText>Last 30 days (approx)</StatHelpText>
                </Stat>

                <Stat>
                  <StatLabel>Daily Average</StatLabel>
                  <StatNumber fontSize="2xl" fontWeight="bold">
                    Ξ {analyticsData.dailyAverage.toFixed(6)}
                  </StatNumber>
                  <StatHelpText>≈ ${(analyticsData.dailyAverage * 2500).toFixed(2)}</StatHelpText>
                </Stat>
              </VStack>
            </CardBody>
          </MotionCard>
        </GridItem>
      </SimpleGrid>

      <Tabs variant="soft-rounded" colorScheme="blue">
        <TabList mb={6}>
          <Tab>Expense Trends</Tab>
          <Tab>Category Analysis</Tab>
          <Tab>Budget Goals</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <MotionCard bg={cardBg} p={6} minH="420px">
              <CardBody>
                <Heading size="md" mb={4}>
                  Expense Trends
                </Heading>

                {analyticsData.trends.labels.length === 0 ? (
                  <Text color={smallText}>No expense history yet</Text>
                ) : (
                  <Box height={{ base: "300px", md: "380px" }}>
                    <Line ref={lineChartRef} data={lineData} options={lineOptions} />
                  </Box>
                )}
              </CardBody>
            </MotionCard>
          </TabPanel>

          <TabPanel p={0}>
            <MotionCard bg={cardBg} p={6} minH="420px">
              <CardBody>
                <Heading size="md" mb={4}>
                  Category Analysis
                </Heading>
                {analyticsData.categoryBreakdown.length === 0 ? (
                  <Text color={smallText}>No categories yet</Text>
                ) : (
                  <Box height={{ base: "320px", md: "420px" }} display="flex" alignItems="center" justifyContent="center">
                    <Box width={{ base: "320px", md: "420px" }} height="100%">
                      <Pie ref={pieChartRef} data={pieData} options={pieOptions} />
                    </Box>
                  </Box>
                )}
              </CardBody>
            </MotionCard>
          </TabPanel>

          <TabPanel p={0}>
            <MotionCard bg={cardBg} p={6} minH="300px">
              <CardBody>
                <Heading size="md" mb={4}>
                  Budget Goals
                </Heading>
                {budgetGoals.length === 0 ? (
                  <Text color={smallText}>No goals (no data)</Text>
                ) : (
                  <VStack spacing={4} align="stretch">
                    {budgetGoals.map((g, i) => {
                      const percent = Math.min(100, Math.round((g.spent / g.goal) * 100));
                      return (
                        <Box key={i}>
                          <HStack justify="space-between">
                            <Text fontWeight="medium">{g.name}</Text>
                            <Text>{percent}%</Text>
                          </HStack>
                          <Progress value={percent} size="sm" borderRadius="full" />
                          <Text fontSize="sm" color={smallText}>
                            Spent: Ξ {g.spent.toFixed(6)} / Goal: Ξ {g.goal.toFixed(6)}
                          </Text>
                        </Box>
                      );
                    })}
                  </VStack>
                )}
              </CardBody>
            </MotionCard>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Analytics;
