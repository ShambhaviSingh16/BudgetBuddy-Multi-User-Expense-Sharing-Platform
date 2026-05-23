// src/pages/Groups.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Heading, Text, Button, Input, useToast, useColorModeValue,
  VStack, Card, CardBody, Flex, AvatarGroup, Avatar,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, FormControl, FormLabel, useDisclosure, HStack, InputGroup,
  InputLeftElement, Icon, Badge, SimpleGrid, Tag
} from "@chakra-ui/react";
import { FiPlus, FiSearch, FiUserPlus } from "react-icons/fi";
import { motion } from "framer-motion";
import {
  createGroupObject, persistNewGroup, listGroupsVisibleTo,
  joinGroupById, getGroupById, markMemberPaid
} from "../components/groupsStorage";
import { useBlockchain } from "../hooks/useBlockchain";

const MotionCard = motion(Card);

const isValidAddress = (a) => /^0x[a-fA-F0-9]{40}$/.test((a||"").trim());

export default function Groups() {
  const { account } = useBlockchain();
  const toast = useToast();

  const [groups, setGroups] = useState([]);
  const [query, setQuery] = useState("");

  // create modal state
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [inviteInput, setInviteInput] = useState("");
  const [invitedList, setInvitedList] = useState([]);

  const cardBg = useColorModeValue("white", "gray.800");
  const hintColor = useColorModeValue("gray.600", "gray.400");

  // view modal
  const { isOpen: viewOpen, onOpen: viewOnOpen, onClose: viewOnClose } = useDisclosure();
  const [viewGroup, setViewGroup] = useState(null);

  function reloadVisible() {
    const visible = listGroupsVisibleTo(account);
    setGroups(visible);
  }

  useEffect(() => {
    reloadVisible();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  // add invite (single address at a time)
  const handleAddInvite = () => {
    const v = (inviteInput || "").trim();
    if (!v) return;
    if (!isValidAddress(v)) {
      toast({ title: "Enter a valid wallet address (0x...)", status: "error" });
      return;
    }
    if ((account || "").toLowerCase() === v.toLowerCase()) {
      toast({ title: "You can't invite yourself", status: "warning" });
      setInviteInput("");
      return;
    }
    if (invitedList.find(a => a.toLowerCase() === v.toLowerCase())) {
      toast({ title: "Already added", status: "info" });
      setInviteInput("");
      return;
    }
    setInvitedList(prev => [...prev, v]);
    setInviteInput("");
  };

  const handleCreateGroup = () => {
    if (!name.trim()) {
      toast({ title: "Group name required", status: "error" });
      return;
    }
    if (!account) {
      toast({ title: "Connect wallet first", status: "error" });
      return;
    }
    const g = createGroupObject({
      name: name.trim(),
      description: description.trim(),
      createdBy: account,
      totalAmount: Number(totalAmount || 0),
      invited: invitedList,
    });
    persistNewGroup(g);
    toast({ title: "Group created. Invites saved.", status: "success" });
    setName(""); setDescription(""); setTotalAmount(""); setInvitedList([]); setInviteInput("");
    onClose();
    reloadVisible();
  };

  const handleJoin = (groupId) => {
    if (!account) { toast({ title: "Connect wallet to join", status: "error" }); return; }
    const res = joinGroupById(groupId, account);
    if (!res) { toast({ title: "Not allowed to join (not invited)", status: "error" }); return; }
    toast({ title: "Joined group", status: "success" });
    reloadVisible();
  };

  const openView = (id) => {
    const g = getGroupById(id);
    setViewGroup(g);
    viewOnOpen();
  };

  const handleMarkPaid = (amount) => {
    if (!account || !viewGroup) return;
    markMemberPaid(viewGroup.id, account, amount);
    // refresh viewGroup and list
    const updated = getGroupById(viewGroup.id);
    setViewGroup(updated);
    reloadVisible();
    toast({ title: `Paid Ξ ${amount}`, status: "success" });
  };

  return (
    <Box p={6}>
      <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
        <Box>
          <Heading>Groups</Heading>
          <Text color={hintColor}>Create or join groups to split expenses</Text>
        </Box>
        <Button colorScheme="blue" onClick={onOpen} leftIcon={<FiPlus />}>Create Group</Button>
      </Flex>

      <Card bg={cardBg} p={4} mb={6} borderRadius="lg" boxShadow="sm">
        <CardBody>
          <HStack>
            <InputGroup maxW="520px">
              <InputLeftElement pointerEvents="none"><Icon as={FiSearch} /></InputLeftElement>
              <Input placeholder="Search groups..." value={query} onChange={e => setQuery(e.target.value)} />
            </InputGroup>
          </HStack>
        </CardBody>
      </Card>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
        {groups.filter(g => g.name.toLowerCase().includes(query.toLowerCase())).map(g => {
          const invitedCount = (g.invited || []).length;
          const joined = (g.members || []).some(m => (m.address || "").toLowerCase() === (account || "").toLowerCase());
          const isOwner = (g.createdBy || "").toLowerCase() === (account || "").toLowerCase();
          const perPerson = g.perPersonExpected || (g.totalAmount ? (Number(g.totalAmount) / Math.max(1, g.expectedCount)) : 0);

          return (
            <MotionCard key={g.id} bg={cardBg} p={4} whileHover={{ y: -6 }} transition={{ duration: 0.18 }} borderRadius="md">
              <CardBody>
                <Flex justify="space-between" align="center" mb={3}>
                  <Box minW="0" flex="1">
                    <Heading size="md" isTruncated>{g.name}</Heading>
                    <Text fontSize="sm" color={hintColor}>{g.category} • {(g.members || []).length} members</Text>
                  </Box>

                  <Box textAlign="right" minW="170px">
                    <AvatarGroup size="sm" max={4} mb={2}>
                      {(g.members || []).map((m, i) => <Avatar key={i} name={m.name} />)}
                    </AvatarGroup>
                    <HStack justify="flex-end">
                      {isOwner && <Badge colorScheme="purple">OWNER</Badge>}
                      {joined ? <Badge colorScheme="green">Joined</Badge> : (invitedCount > 0 ? <Badge colorScheme="yellow">{invitedCount} invited</Badge> : <Badge>Public</Badge>)}
                    </HStack>
                  </Box>
                </Flex>

                <Flex justify="space-between" align="center">
                  <Box minW="0" mr={4}>
                    <Text fontSize="sm" color={hintColor} noOfLines={2}>{g.description || "No description"}</Text>
                    <Text mt={2} fontSize="sm" color={hintColor}>Per person expected: Ξ {perPerson.toFixed(6)}</Text>
                  </Box>

                  <VStack spacing={2}>
                    {!joined && ((g.invited || []).some(i => (i || "").toLowerCase() === (account || "").toLowerCase()) || isOwner) ? (
                      <Button size="sm" colorScheme="blue" onClick={() => handleJoin(g.id)}>Join</Button>
                    ) : null}
                    <Button size="sm" variant="ghost" onClick={() => openView(g.id)}>View</Button>
                  </VStack>
                </Flex>
              </CardBody>
            </MotionCard>
          );
        })}
      </SimpleGrid>

      {/* Create Group Modal */}
      <Modal isOpen={isOpen} onClose={() => { setInvitedList([]); onClose(); }}>
        <ModalOverlay />
        <ModalContent mx={3} maxW="640px">
          <ModalHeader>Create Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Group Name</FormLabel>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Trip to Goa" />
              </FormControl>

              <FormControl>
                <FormLabel>Description (optional)</FormLabel>
                <Input value={description} onChange={e => setDescription(e.target.value)} placeholder="Short description" />
              </FormControl>

              <FormControl>
                <FormLabel>Total Amount (ETH) — optional</FormLabel>
                <Input value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="0.00" type="number" step="0.000001" />
                <Text mt={1} fontSize="sm" color={hintColor}>If set, this amount will be split among expected participants (owner + invited).</Text>
              </FormControl>

              <FormControl>
                <FormLabel>Add Member Address</FormLabel>
                <HStack>
                  <Input placeholder="0x..." value={inviteInput} onChange={e => setInviteInput(e.target.value)} />
                  <Button leftIcon={<FiUserPlus />} onClick={handleAddInvite} colorScheme="purple">Add</Button>
                </HStack>

                <HStack mt={3} spacing={2} wrap="wrap">
                  {invitedList.map((a, i) => (
                    <Tag key={i} size="md" colorScheme="blue">{a}</Tag>
                  ))}
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => { setInvitedList([]); onClose(); }}>Cancel</Button>
            <Button colorScheme="blue" onClick={handleCreateGroup}>Create Group</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Group Modal */}
      <Modal isOpen={viewOpen} onClose={() => { setViewGroup(null); viewOnClose(); }}>
        <ModalOverlay />
        <ModalContent mx={3} maxW="700px">
          <ModalHeader>Group Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {viewGroup ? (
              <VStack align="stretch" spacing={4}>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Heading size="md">{viewGroup.name}</Heading>
                    <Text fontSize="sm" color={hintColor}>{viewGroup.description}</Text>
                    <Text fontSize="sm" mt={2}>Expected people: {viewGroup.expectedCount}</Text>
                    <Text fontSize="sm">Total amount: Ξ {Number(viewGroup.totalAmount || 0).toFixed(6)}</Text>
                    <Text fontSize="sm">Per person (expected): Ξ {Number(viewGroup.perPersonExpected || viewGroup.perPersonExpected === 0 ? viewGroup.perPersonExpected : 0).toFixed(6)}</Text>
                  </Box>

                  <AvatarGroup size="md" max={6}>
                    {(viewGroup.members || []).map((m, i) => <Avatar key={i} name={m.name} />)}
                    {(viewGroup.invited || []).map((a, i) => <Avatar key={"inv"+i} name={a} />)}
                  </AvatarGroup>
                </Flex>

                <Box>
                  <Heading size="sm" mb={2}>Members</Heading>
                  <VStack align="stretch" spacing={2}>
                    {(viewGroup.members || []).map((m, i) => (
                      <Flex key={i} justify="space-between" align="center" p={3} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="md">
                        <Flex align="center" gap={3}>
                          <Avatar name={m.name} size="sm" />
                          <Box>
                            <Text fontWeight="medium">{m.name}</Text>
                            <Text fontSize="sm" isTruncated maxW="420px">{m.address}</Text>
                          </Box>
                        </Flex>
                        <Box textAlign="right">
                          <Text fontWeight="semibold">Paid: Ξ {Number(m.paid || 0).toFixed(6)}</Text>
                          <Text fontSize="sm">Balance: Ξ { (Number(viewGroup.perPersonExpected || 0) - Number(m.paid || 0)).toFixed(6) }</Text>
                        </Box>
                      </Flex>
                    ))}
                  </VStack>
                </Box>

                {viewGroup.invited?.length > 0 && (
                  <Box>
                    <Heading size="sm" mb={2}>Pending Invites</Heading>
                    <VStack align="stretch" spacing={2}>
                      {viewGroup.invited.map((a, i) => (
                        <Flex key={i} align="center" justify="space-between" p={2} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="md">
                          <Text isTruncated maxW="560px">{a}</Text>
                          <Text fontSize="sm" color={hintColor}>Invited</Text>
                        </Flex>
                      ))}
                    </VStack>
                  </Box>
                )}

                {/* If current user is a member, allow settle action */}
                {/* {viewGroup.members?.some(m => (m.address || "").toLowerCase() === (account || "").toLowerCase()) && (
                  <Box>
                    <Heading size="sm" mb={2}>Quick Settle</Heading>
                    <Text fontSize="sm" color={hintColor} mb={2}>Simulate paying your owed amount. This is a UI simulation — connect to your payment/ethers flow later.</Text>
                    <HStack>
                      <Button colorScheme="purple" onClick={() => handleMarkPaid(viewGroup.perPersonExpected || 0)}>Settle Full Share</Button>
                      <Button variant="outline" onClick={() => handleMarkPaid(0.001)}>Pay 0.001 ETH (demo)</Button>
                    </HStack>
                    {viewGroup.settled && <Text color="green.400" mt={2}>Group fully settled ✅</Text>}
                  </Box>
                )} */}
              </VStack>
            ) : <Text>No group selected</Text>}
          </ModalBody>

          <ModalFooter>
            <Button onClick={() => { setViewGroup(null); viewOnClose(); }}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
