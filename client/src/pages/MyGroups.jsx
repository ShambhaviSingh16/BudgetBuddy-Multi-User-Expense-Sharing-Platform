// src/pages/MyGroups.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Heading, Text, VStack, Card, CardBody, CardHeader, Flex, Avatar, Badge,
  Button, Input, InputGroup, InputLeftElement, useColorModeValue, SimpleGrid, Stack,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, ModalFooter, HStack,
  Progress, useToast, Tag, Spacer, Stat, StatLabel, StatNumber
} from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import { useBlockchain } from "../hooks/useBlockchain";
import {
  listGroupsVisibleTo, leaveGroupById, getGroupById, markMemberPaid
} from "../components/groupsStorage";
import { motion } from "framer-motion";
import { ethers } from "ethers";

const MotionCard = motion(Card);

export default function MyGroups() {
  const { account, signer } = useBlockchain(); // signer used for on-chain pay
  const toast = useToast();

  const [groups, setGroups] = useState([]);
  const [q, setQ] = useState("");
  const hintColor = useColorModeValue("gray.600", "gray.400");
  const cardBg = useColorModeValue("white", "gray.800");

  // view modal for member actions & settlement
  const [viewGroup, setViewGroup] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [payInProgress, setPayInProgress] = useState(false);

  function reload() {
    if (!account) return setGroups([]);
    const visible = listGroupsVisibleTo(account).filter(g => (g.members || []).some(m => (m.address || "").toLowerCase() === (account || "").toLowerCase()));
    setGroups(visible);
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const handleLeave = (id) => {
    const res = leaveGroupById(id, account);
    if (!res) {
      toast({ title: "Unable to leave (owner can't leave).", status: "error" });
      return;
    }
    toast({ title: "Left group", status: "info" });
    reload();
  };

  const openView = (id) => {
    const g = getGroupById(id);
    setViewGroup(g);
    setViewOpen(true);
  };

  const closeView = () => {
    setViewGroup(null);
    setViewOpen(false);
    reload();
  };

  // compute per-person
  const computePerPerson = (g) => {
    return g.totalAmount ? Number(g.totalAmount) / Math.max(1, g.expectedCount) : 0;
  };

  // compute group progress: totalPaid / totalAmount
  const groupPaidProgress = (g) => {
    if (!g || !g.totalAmount) return 0;
    const totalPaid = (g.members || []).reduce((s, m) => s + Number(m.paid || 0), 0);
    return Math.min(100, Math.round((totalPaid / Number(g.totalAmount || 0)) * 100));
  };

  // on-chain payment flow: send ETH to group.owner (createdBy)
  const payOutstandingOnChain = async (groupId) => {
    if (!account || !signer) {
      toast({ title: "Connect wallet to pay on-chain.", status: "error" });
      return;
    }
    const g = getGroupById(groupId);
    if (!g) {
      toast({ title: "Group not found", status: "error" });
      return;
    }

    const meIndex = (g.members || []).findIndex(m => (m.address || "").toLowerCase() === (account || "").toLowerCase());
    if (meIndex === -1) {
      toast({ title: "You are not a member of this group.", status: "error" });
      return;
    }

    const per = computePerPerson(g);
    const owed = Number((per - Number(g.members[meIndex].paid || 0)).toFixed(6));
    if (owed <= 0) {
      toast({ title: "No outstanding amount", status: "info" });
      return;
    }

    try {
      setPayInProgress(true);
      toast({ title: `Sending Ξ ${owed} to group owner — please confirm in your wallet`, status: "info", duration: 3000 });

      // parseEther (ethers v6)
      const value = ethers.parseEther(String(owed));

      const tx = await signer.sendTransaction({
        to: g.createdBy,
        value
      });

      toast({ title: "Transaction sent — waiting for confirmation...", status: "info", duration: 4000 });

      const receipt = await tx.wait(1);

      if (receipt && receipt.status === 1) {
        // mark paid in local storage using existing helper
        markMemberPaid(groupId, account, owed);

        // refresh view and lists
        const updated = getGroupById(groupId);
        setViewGroup(updated);
        reload();

        toast({ title: `Payment confirmed: Ξ ${owed}`, status: "success" });
      } else {
        toast({ title: "Transaction failed or reverted", status: "error" });
      }
    } catch (err) {
      console.error("Payment error:", err);
      if (err?.code === 4001) {
        toast({ title: "Transaction rejected by user", status: "warning" });
      } else {
        toast({ title: "Payment failed", description: err?.message || String(err), status: "error", duration: 7000 });
      }
    } finally {
      setPayInProgress(false);
    }
  };

  // demo settle full share (UI-only fallback)
  const settleFullShareDemo = (groupId) => {
    const g = getGroupById(groupId);
    if (!g) return;
    const meIndex = (g.members || []).findIndex(m => (m.address || "").toLowerCase() === (account || "").toLowerCase());
    if (meIndex === -1) return;
    const per = computePerPerson(g);
    markMemberPaid(groupId, account, per - Number(g.members[meIndex].paid || 0));
    toast({ title: "Settled locally (demo)", status: "success" });
    closeView();
  };

  return (
    <Box p={6}>
      <Heading mb={3}>My Groups</Heading>
      <Text mb={6} color={hintColor}>Manage groups you are a member of</Text>

      <InputGroup mb={4} maxW="480px">
        <InputLeftElement pointerEvents="none"><FiSearch /></InputLeftElement>
        <Input placeholder="Search my groups..." value={q} onChange={e=>setQ(e.target.value)} />
      </InputGroup>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {groups.filter(g => g.name.toLowerCase().includes(q.toLowerCase())).map(g => {
          const perPerson = computePerPerson(g);
          const me = (g.members || []).find(m => (m.address || "").toLowerCase() === (account || "").toLowerCase());
          const owner = (g.createdBy || "").toLowerCase() === (account || "").toLowerCase();

          const progress = groupPaidProgress(g); // 0-100

          return (
            <MotionCard key={g.id} bg={cardBg} p={4} whileHover={{ y: -4 }} transition={{ duration: 0.16 }} borderRadius="md">
              <CardHeader px={0} py={0}>
                <Flex justify="space-between" align="center" minW="0">
                  <Box minW={0}>
                    <Heading size="md" isTruncated>{g.name}</Heading>
                    <Text fontSize="sm" color={hintColor}>{g.category} • {g.members?.length ?? 0} members</Text>
                  </Box>
                  <Badge ml={4} colorScheme={g.createdBy?.toLowerCase() === (account||"").toLowerCase() ? "purple" : "gray"}>
                    {g.createdBy?.toLowerCase() === (account||"").toLowerCase() ? "Owner" : "Member"}
                  </Badge>
                </Flex>
              </CardHeader>

              <CardBody px={0}>
                <VStack align="stretch" spacing={3}>
                  <Text noOfLines={2}>{g.description || "No description"}</Text>

                  <VStack align="stretch" spacing={2}>
                    {(g.members || []).map((m, idx) => {
                      const isMe = (m.address || "").toLowerCase() === (account || "").toLowerCase();
                      const memberPaid = Number(m.paid || 0);
                      const memberBalance = Number((perPerson - memberPaid).toFixed(6));
                      return (
                        <Flex
                          key={idx}
                          justify="space-between"
                          align="center"
                          p={3}
                          bg={useColorModeValue("gray.50","gray.700")}
                          borderRadius="md"
                          minW={0}
                        >
                          <Flex align="center" gap={3} minW={0} flex="1">
                            <Avatar name={m.name} size="sm" />
                            <Box minW={0}>
                              <Text fontWeight="medium" isTruncated maxW="240px">{isMe ? "You" : m.name}</Text>
                              <Text fontSize="sm" isTruncated maxW="240px">{m.address}</Text>
                            </Box>
                          </Flex>

                          {/* Right column: amounts - fixed width, no shrink */}
                          <Box textAlign="right" minW="150px" flexShrink={0} ml={4}>
                            <Text fontWeight="semibold">Ξ {memberPaid.toFixed(6)}</Text>
                            <Text fontSize="sm">Balance: Ξ {memberBalance.toFixed(6)}</Text>
                            {/* Show Paid tag for ANY member whose balance <= 0 */}
                            {memberBalance <= 0 ? (
                              <Tag size="sm" mt={2} colorScheme="green">Paid</Tag>
                            ) : null}
                          </Box>
                        </Flex>
                      );
                    })}
                  </VStack>

                  {/* Group-level progress + per-person text */}
                  <Box>
                    <HStack mb={2} alignItems="flex-end">
                      <Stat>
                        <StatLabel>Group collected</StatLabel>
                        {/* make number a bit smaller than before but still highlighted */}
                        <StatNumber fontSize="lg">
                          {((g.members || []).reduce((s,m)=>s+Number(m.paid||0),0)).toFixed(6)} / {Number(g.totalAmount || 0).toFixed(6)} ETH
                        </StatNumber>
                      </Stat>
                      <Spacer />
                      <Text fontSize="sm" color={hintColor}>Progress: {progress}%</Text>
                    </HStack>
                    <Progress value={progress} size="sm" borderRadius="md" />
                  </Box>

                  <Flex justify="space-between" align="center">
                    <Box>
                      <Text fontSize="sm" color={hintColor}>Per person expected: Ξ {perPerson.toFixed(6)}</Text>
                    </Box>
                    <Stack direction="row" spacing={3}>
                      <Button colorScheme="red" onClick={()=>handleLeave(g.id)}>Leave Group</Button>
                      <Button variant="outline" onClick={() => openView(g.id)}>View</Button>
                    </Stack>
                  </Flex>
                </VStack>
              </CardBody>
            </MotionCard>
          );
        })}

        {groups.length === 0 && (
          <Card><CardBody><Text>No groups where you're a member yet.</Text></CardBody></Card>
        )}
      </SimpleGrid>

      {/* View modal for MyGroups (with settlement) */}
      <Modal isOpen={viewOpen} onClose={closeView} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Group Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {viewGroup ? (
              <VStack align="stretch" spacing={4}>
                <Flex justify="space-between" align="center">
                  <Box minW={0}>
                    <Heading size="md">{viewGroup.name}</Heading>
                    <Text fontSize="sm" color={hintColor}>{viewGroup.description}</Text>
                    <Text fontSize="sm" mt={2}>Per person expected: Ξ {computePerPerson(viewGroup).toFixed(6)}</Text>
                  </Box>

                  <Avatar size="md" name={viewGroup.name} />
                </Flex>

                <Box>
                  <Heading size="sm" mb={2}>Members</Heading>
                  <VStack align="stretch" spacing={2}>
                    {(viewGroup.members || []).map((m, i) => (
                      <Flex key={i} justify="space-between" align="center" p={3} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="md" minW={0}>
                        <Flex align="center" gap={3} minW={0} flex="1">
                          <Avatar name={m.name} size="sm" />
                          <Box minW={0}>
                            <Text fontWeight="medium" isTruncated maxW="240px">{m.name}</Text>
                            <Text fontSize="sm" isTruncated maxW="240px">{m.address}</Text>
                          </Box>
                        </Flex>
                        <Box textAlign="right" minW="140px" flexShrink={0} ml={4}>
                          <Text fontWeight="semibold">Paid: Ξ {Number(m.paid || 0).toFixed(6)}</Text>
                          <Text fontSize="sm">Balance: Ξ { (viewGroup.totalAmount ? ((computePerPerson(viewGroup)) - Number(m.paid || 0)).toFixed(6) : "0.000000") }</Text>
                          {/* show paid tag for any member who has cleared */}
                          {((computePerPerson(viewGroup) - Number(m.paid || 0)) <= 0) && (
                            <Tag size="sm" mt={2} colorScheme="green">Paid</Tag>
                          )}
                        </Box>
                      </Flex>
                    ))}
                  </VStack>
                </Box>

                {viewGroup.invited?.length > 0 && (
                  <Box>
                    <Heading size="sm" mb={2}>Pending Invites</Heading>
                    <VStack align="stretch">
                      {viewGroup.invited.map((a, i) => (
                        <Flex key={i} align="center" justify="space-between" p={2} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="md">
                          <Text isTruncated maxW="80%">{a}</Text>
                          <Text fontSize="sm" color={hintColor}>Invited</Text>
                        </Flex>
                      ))}
                    </VStack>
                  </Box>
                )}

                <Box>
                  <Heading size="sm" mb={2}>Settle your outstanding</Heading>
                  <Text fontSize="sm" color={hintColor} mb={2}>Send ETH to the group owner (on-chain) to settle your outstanding balance. You will be prompted by MetaMask to confirm the transaction.</Text>

                  <HStack spacing={3}>
                    <Button colorScheme="purple" isLoading={payInProgress} onClick={() => payOutstandingOnChain(viewGroup.id)}>Pay outstanding (on-chain)</Button>
                    {/* <Button variant="outline" onClick={() => settleFullShareDemo(viewGroup.id)}>Settle Full Share (demo)</Button> */}
                  </HStack>
                </Box>
              </VStack>
            ) : <Text>No group selected.</Text>}
          </ModalBody>

          <ModalFooter>
            <Button onClick={closeView}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
