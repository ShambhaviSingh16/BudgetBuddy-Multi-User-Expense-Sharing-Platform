// src/pages/Settings.jsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  CardHeader,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Switch,
  useColorMode,
  useColorModeValue,
  useToast,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  CircularProgress,
  CircularProgressLabel,
  Spacer,
  Avatar,
  VisuallyHidden,
} from "@chakra-ui/react";
import { FiSave, FiRotateCw, FiDownload, FiUpload, FiX } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext"; // expects { darkMode, toggleTheme }
import { useBlockchain } from "../hooks/useBlockchain";

/* ModuleTab helper (visual tab style) */
const ModuleTab = (props) => (
  <Tab
    px={6}
    py={3}
    borderRadius="lg"
    _selected={{
      bg: useColorModeValue("blue.50", "blue.900"),
      color: useColorModeValue("blue.700", "blue.200"),
      transform: "translateY(-2px)",
      boxShadow: "md",
    }}
    {...props}
  />
);

const Settings = () => {
  const { currentUser, userProfile, updateUserProfile, deleteAccount } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { colorMode, setColorMode } = useColorMode();
  const {
    account,
    balance,
    isConnected,
    expenses,
    connectWallet,
    disconnectWallet,
    fetchExpenses,
  } = useBlockchain();
  const toast = useToast();

  // Profile form state
  const [displayName, setDisplayName] = useState(userProfile?.displayName ?? "");
  const [saving, setSaving] = useState(false);

  // Avatar state (preview and base64 to persist)
  const [avatarPreview, setAvatarPreview] = useState(userProfile?.avatar ?? null); // could be URL or base64
  const [avatarBase64, setAvatarBase64] = useState(null);

  // Budget
  const [budget, setBudget] = useState(() => {
    const fromProfile = userProfile?.budget;
    if (fromProfile !== undefined && fromProfile !== null) return String(fromProfile);
    return localStorage.getItem("bb_monthly_budget") ?? "";
  });
  const [savingBudget, setSavingBudget] = useState(false);

  useEffect(() => {
    setDisplayName(userProfile?.displayName ?? "");
    if (userProfile?.budget !== undefined && userProfile?.budget !== null) {
      setBudget(String(userProfile.budget));
    }
    // prefer persisted avatar if present in profile
    if (userProfile?.avatar) {
      setAvatarPreview(userProfile.avatar);
      setAvatarBase64(null);
    }
  }, [userProfile]);

  // compute expense stats
  const expenseStats = useMemo(() => {
    if (!Array.isArray(expenses)) return { totalEth: 0, count: 0, byCategory: {} };
    let total = 0;
    const byCategory = {};
    for (const e of expenses) {
      // careful mixing ?? and || — use parentheses
      const amt = Number(e.amountEth ?? (e.amount || 0));
      if (!isNaN(amt)) total += amt;
      const c = e.category ?? "other";
      byCategory[c] = (byCategory[c] || 0) + (isNaN(amt) ? 0 : amt);
    }
    return { totalEth: total, count: expenses.length, byCategory };
  }, [expenses]);

  const budgetFloat = Number(budget || 0);
  const percentUsed =
    budgetFloat > 0 ? Math.min(100, Math.round((expenseStats.totalEth / budgetFloat) * 100)) : 0;

  // Avatar input handling
  const handleAvatarInput = async (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please choose an image file.", status: "error" });
      return;
    }

    // preview using object URL (fast)
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    // also create base64 for persisting (small files should be fine)
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarBase64(String(reader.result)); // data:<mime>;base64,...
    };
    reader.onerror = () => {
      toast({ title: "Preview error", status: "warning", description: "Couldn't read the image for upload." });
    };
    reader.readAsDataURL(file);
  };

  // remove chosen avatar (revert to default/no avatar)
  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarBase64(null);
    // If you want to signal removal to server, you can pass avatar: null in updateUserProfile
  };

  // Handlers
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const payload = { displayName: displayName?.trim() ?? "" };
      // if user picked a new avatarBase64, include it
      if (avatarBase64) payload.avatar = avatarBase64;
      // If they removed avatar and profile had one, send avatar: null to remove
      if (!avatarPreview && userProfile?.avatar) payload.avatar = null;

      if (updateUserProfile) {
        await updateUserProfile(payload);
        toast({ title: "Profile saved", status: "success", duration: 2200 });
      } else {
        // fallback: store in localStorage
        const localProfile = { ...userProfile, ...payload };
        localStorage.setItem("bb_profile_local", JSON.stringify(localProfile));
        toast({ title: "Saved locally", status: "info", description: "No server update available." });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Save failed", status: "error", description: err?.message ?? String(err) });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveBudget = async () => {
    try {
      setSavingBudget(true);
      if (updateUserProfile) {
        await updateUserProfile({ budget: budgetFloat });
        toast({ title: "Budget saved", status: "success", duration: 2000 });
      } else {
        localStorage.setItem("bb_monthly_budget", String(budgetFloat));
        toast({ title: "Budget saved locally", status: "info", duration: 1800 });
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error saving budget", status: "error" });
    } finally {
      setSavingBudget(false);
    }
  };

  const handleExport = () => {
    const payload = {
      profile: userProfile ?? null,
      firebaseUserEmail: currentUser?.email ?? null,
      onchain: { address: account ?? null, balance: balance ?? null },
      expenses,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `budgetbuddy-export-${currentUser?.email ?? "user"}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast({ title: "Export started", status: "success", duration: 2000 });
  };

  const handleDelete = async () => {
    if (!deleteAccount) {
      toast({ title: "Delete not supported", status: "error", description: "deleteAccount not implemented" });
      return;
    }
    try {
      await deleteAccount();
      toast({ title: "Account deleted", status: "success" });
    } catch (err) {
      console.error(err);
      toast({ title: "Delete failed", status: "error", description: err?.message ?? String(err) });
    }
  };

  const handleWalletToggle = async () => {
    if (!isConnected) {
      await connectWallet();
      await fetchExpenses();
    } else {
      disconnectWallet();
    }
  };

  // NEW: ensure theme toggles both ThemeContext and Chakra colorMode
  const handleToggleDarkMode = () => {
    toggleTheme?.();
    setColorMode(darkMode ? "light" : "dark");
  };

  // Avatar initials
  const avatarLabel = (() => {
    const email = currentUser?.email ?? userProfile?.email ?? "";
    if (!email) return "U";
    return email.trim()[0].toUpperCase();
  })();

  return (
    <Box px={{ base: 4, md: 8 }} py={8}>
      <Heading mb={2}>Settings</Heading>
      <Text color="gray.500" mb={6}>
        Manage account preferences, wallet and budget. Changes are saved to your profile where possible.
      </Text>

      <Tabs variant="unstyled" isFitted>
        <Box bg={useColorModeValue("white", "gray.800")} borderRadius="xl" p={4} mb={6} boxShadow="sm">
          <TabList display="flex" gap={3}>
            <ModuleTab>Profile</ModuleTab>
            <ModuleTab>Appearance</ModuleTab>
            <ModuleTab>Wallet & Usage</ModuleTab>
            <ModuleTab>Budget</ModuleTab>
            <ModuleTab>Data</ModuleTab>
          </TabList>
        </Box>

        <TabPanels>
          {/* PROFILE */}
          <TabPanel p={0}>
            <Card borderRadius="xl" mb={6}>
              <CardHeader>
                <HStack justify="space-between" align="center" w="full">
                  <Box>
                    <Heading size="md">Profile Information</Heading>
                    <Text fontSize="sm" color="gray.500">Profile information (email is read-only)</Text>
                  </Box>

                  {/* Avatar area (left-style in screenshot) */}
                  <HStack spacing={4} align="center">
                    <Avatar
                      name={displayName || currentUser?.email || avatarLabel}
                      size="xl"
                      src={avatarPreview ?? undefined}
                      bg="blue.400"
                      color="white"
                    >
                      {!avatarPreview && avatarLabel}
                    </Avatar>

                    <VStack spacing={1} align="start">
                      <VisuallyHidden>
                        <input id="avatarInput" type="file" accept="image/*" onChange={handleAvatarInput} />
                      </VisuallyHidden>

                      <HStack>
                        <Button
                          size="sm"
                          leftIcon={<FiUpload />}
                          onClick={() => document.getElementById("avatarInput")?.click?.()}
                        >
                          Change Avatar
                        </Button>

                        {/* show remove only if preview exists */}
                        {avatarPreview && (
                          <Button size="sm" variant="ghost" leftIcon={<FiX />} onClick={handleRemoveAvatar}>
                            Remove
                          </Button>
                        )}
                      </HStack>

                      {/* NOTE: you requested the 'recommended size' to be present in earlier screenshots.
                          If you don't want it, remove the Text below. */}
                      <Text fontSize="xs" color="gray.400">
                        Recommended: 256×256 pixels, JPG or PNG
                      </Text>
                    </VStack>
                  </HStack>
                </HStack>
              </CardHeader>

              <CardBody>
                <VStack align="start" spacing={4}>
                  <FormControl>
                    <FormLabel>Display Name</FormLabel>
                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Email Address</FormLabel>
                    <Input value={currentUser?.email ?? userProfile?.email ?? ""} isReadOnly />
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      Email cannot be changed
                    </Text>
                  </FormControl>

                  <HStack>
                    <Button colorScheme="blue" leftIcon={<FiSave />} onClick={handleSaveProfile} isLoading={saving}>
                      Save Changes
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* APPEARANCE */}
          <TabPanel p={0}>
            <Card borderRadius="xl" mb={6}>
              <CardHeader>
                <Heading size="md">Appearance</Heading>
                <Text fontSize="sm" color="gray.500">Toggle theme and interface preferences</Text>
              </CardHeader>
              <CardBody>
                <HStack justify="space-between" mb={4}>
                  <Box>
                    <Text fontWeight="semibold">Dark mode</Text>
                    <Text fontSize="sm" color="gray.500">Switch between light and dark themes</Text>
                  </Box>
                  <Switch isChecked={Boolean(darkMode)} onChange={handleToggleDarkMode} colorScheme="blue" />
                </HStack>

                <Divider my={4} />

                <Text fontSize="sm" color="gray.500" mb={2}>UI density</Text>
                <HStack gap={3}>
                  <Button size="sm" variant="outline" onClick={() => setColorMode("light")}>
                    Compact — Light
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setColorMode("dark")}>
                    Comfort — Dark
                  </Button>
                </HStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* WALLET & USAGE */}
          <TabPanel p={0}>
            <Flex gap={6} direction={{ base: "column", md: "row" }}>
              <Box flex="1">
                <Card borderRadius="xl" mb={6}>
                  <CardHeader>
                    <Heading size="md">Wallet & Usage</Heading>
                    <Text fontSize="sm" color="gray.500">On-chain wallet and quick stats</Text>
                  </CardHeader>
                  <CardBody>
                    <VStack align="start" spacing={4}>
                      <Text fontSize="sm" color="gray.500">Address</Text>
                      <Text fontSize="sm" wordBreak="break-all" fontFamily="mono">{account ?? "Not connected"}</Text>

                      <HStack width="100%" justify="space-between">
                        <VStack align="start" spacing={0}>
                          <Text fontSize="sm" color="gray.500">On-chain Wallet balance</Text>
                          <Heading size="md">{Number(balance || 0).toFixed(6)} ETH</Heading>
                        </VStack>

                        <VStack align="end">
                          <Button size="sm" onClick={handleWalletToggle}>{isConnected ? "Disconnect" : "Connect Wallet"}</Button>
                          <Button size="sm" variant="ghost" onClick={() => fetchExpenses()}>Refresh</Button>
                        </VStack>
                      </HStack>

                      <Divider />

                      <HStack width="100%" spacing={4} align="center">
                        <Box>
                          <CircularProgress value={percentUsed} size="90px" thickness="10px" color="green.400">
                            <CircularProgressLabel>{percentUsed}%</CircularProgressLabel>
                          </CircularProgress>
                        </Box>
                        <Box>
                          <Text fontSize="sm" color="gray.500">Budget used</Text>
                          <Heading size="md">{Number(expenseStats.totalEth || 0).toFixed(4)} ETH</Heading>
                          <Text fontSize="sm" color="gray.500">{expenseStats.count} items • {budgetFloat ? `${Number(budgetFloat).toFixed(4)} ETH budget` : "No budget set"}</Text>
                        </Box>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </Box>

              <Box w={{ base: "100%", md: "380px" }}>
                <Card borderRadius="xl" mb={6}>
                  <CardHeader>
                    <Heading size="md">Quick Stats</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack align="stretch" spacing={3}>
                      <Stat p={3} borderRadius="md" bg={useColorModeValue("gray.50", "gray.700")}>
                        <StatLabel fontSize="sm">On-chain Total Expense</StatLabel>
                        <StatNumber fontSize="lg">{Number(expenseStats.totalEth || 0).toFixed(4)} ETH</StatNumber>
                      </Stat>
                      <Stat p={3} borderRadius="md" bg={useColorModeValue("gray.50", "gray.700")}>
                        <StatLabel fontSize="sm">Local Wallet</StatLabel>
                        <StatNumber fontSize="lg">{Number(balance || 0).toFixed(6)} ETH</StatNumber>
                      </Stat>
                      <Stat p={3} borderRadius="md" bg={useColorModeValue("gray.50", "gray.700")}>
                        <StatLabel fontSize="sm">Expenses (count)</StatLabel>
                        <StatNumber fontSize="lg">{expenseStats.count}</StatNumber>
                      </Stat>
                    </VStack>
                  </CardBody>
                </Card>
              </Box>
            </Flex>
          </TabPanel>

          {/* BUDGET */}
          <TabPanel p={0}>
            <Card borderRadius="xl" mb={6}>
              <CardHeader>
                <Heading size="md">Monthly Budget</Heading>
                <Text fontSize="sm" color="gray.500">Set the monthly ETH budget for tracking</Text>
              </CardHeader>
              <CardBody>
                <HStack spacing={4}>
                  <Input
                    maxW="200px"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="0.00 (ETH)"
                    type="number"
                    step="0.0001"
                  />
                  <Button onClick={handleSaveBudget} isLoading={savingBudget} leftIcon={<FiRotateCw />}>Save Budget</Button>
                  <Spacer />
                  <Text color="gray.500">Spent: {Number(expenseStats.totalEth || 0).toFixed(4)} ETH</Text>
                </HStack>
              </CardBody>
            </Card>
          </TabPanel>

          {/* DATA */}
          <TabPanel p={0}>
            <Card borderRadius="xl" mb={6}>
              <CardHeader>
                <Heading size="md">Data Management</Heading>
                <Text fontSize="sm" color="gray.500">Export or remove your data</Text>
              </CardHeader>
              <CardBody>
                <HStack spacing={3}>
                  <Button leftIcon={<FiDownload />} colorScheme="blue" onClick={handleExport}>Export JSON</Button>
                  <Button colorScheme="red" variant="outline" onClick={handleDelete}>Delete account</Button>
                </HStack>
                <Text fontSize="sm" color="gray.500" mt={4}>
                  Export includes profile, on-chain address, and locally loaded expenses. Deleting account will remove profile via your AuthContext (if implemented).
                </Text>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default Settings;
