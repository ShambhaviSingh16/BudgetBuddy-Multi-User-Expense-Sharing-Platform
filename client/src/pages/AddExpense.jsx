import { getContract } from "../utils/contract";
import React, { useState } from 'react';
import {
  Box,
  Heading,                                        
  FormControl,
  FormLabel,
  Input,
  Select,
  Button,
  useToast,
  useColorModeValue,
  VStack,
  Card,
  CardBody,
  Text,
  HStack,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex
} from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { useBlockchain } from '../hooks/useBlockchain';
import { FiPlus, FiAlertCircle, FiDollarSign, FiTag, FiCalendar } from 'react-icons/fi';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const AddExpense = () => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState('');
  
  const toast = useToast();
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.600", "gray.400");
  
  const { addExpense, loading, isConnected, balance } = useBlockchain();

  const handleAddExpense = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        status: "warning",
        duration: 3000,
        isClosable: true,
        position: "top-right"
      });
      return;
    }

    if (parseFloat(amount) > parseFloat(balance)) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough ETH in your wallet",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top-right"
      });
      return;
    }

    const success = await addExpense(title, amount, category);
    
    if (success) {
      toast({
        title: "Expense Added",
        description: "Your expense has been recorded on the blockchain.",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right"
      });
      
      setTitle('');
      setAmount('');
      setDate('');
      setCategory('');
    }
  };

  const categories = [
    { value: "food", label: "Food & Dining", icon: "🍕" },
    { value: "travel", label: "Travel", icon: "✈️" },
    { value: "utilities", label: "Utilities", icon: "💡" },
    { value: "entertainment", label: "Entertainment", icon: "🎬" },
    { value: "shopping", label: "Shopping", icon: "🛒" },
    { value: "health", label: "Health", icon: "🏥" },
    { value: "education", label: "Education", icon: "📚" },
    { value: "other", label: "Other", icon: "📦" }
  ];

  return (
    <Box p={6}>
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        mb={8}
      >
        <Heading as="h1" size="xl" mb={2} color={useColorModeValue("gray.700", "white")}>
          Add New Expense
        </Heading>
        <Text color={textColor}>
          Record your expenses on the blockchain for transparent tracking
        </Text>
      </MotionBox>
      
      {!isConnected ? (
        <MotionCard
          bg={cardBg}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          maxW="600px"
          mx="auto"
          overflow="hidden"
        >
          <Alert status="warning" variant="left-accent" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Wallet Not Connected</AlertTitle>
              <AlertDescription>
                Please connect your wallet to add expenses to the blockchain.
              </AlertDescription>
            </Box>
          </Alert>
        </MotionCard>
      ) : (
        <>
          <MotionCard
            bg={cardBg}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            maxW="600px"
            mx="auto"
            overflow="hidden"
            boxShadow="xl"
            borderRadius="xl"
          >
            <CardBody p={6}>
              <Flex align="center" mb={6} color={useColorModeValue("blue.500", "blue.300")}>
                <Icon as={FiPlus} boxSize={6} mr={2} />
                <Heading size="md">New Expense</Heading>
              </Flex>
              
              <form onSubmit={handleAddExpense}>
                <VStack spacing={6}>
                  <FormControl isRequired>
                    <FormLabel display="flex" alignItems="center">
                      <Icon as={FiTag} mr={2} /> Title
                    </FormLabel>
                    <Input
                      type="text"
                      placeholder="What did you spend on?"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      size="lg"
                      borderRadius="lg"
                      focusBorderColor="blue.500"
                    />
                  </FormControl>
                  
                  <FormControl isRequired>
                    <FormLabel display="flex" alignItems="center">
                      <Icon as={FiDollarSign} mr={2} /> Amount (ETH)
                    </FormLabel>
                    <Input
                      type="number"
                      step="0.001"
                      min="0"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      size="lg"
                      borderRadius="lg"
                      focusBorderColor="blue.500"
                    />
                    {amount && (
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Balance: {balance} ETH
                      </Text>
                    )}
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel display="flex" alignItems="center">
                      <Icon as={FiCalendar} mr={2} /> Date
                    </FormLabel>
                    <Input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      size="lg"
                      borderRadius="lg"
                      focusBorderColor="blue.500"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Category</FormLabel>
                    <Select
                      placeholder="Select category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      size="lg"
                      borderRadius="lg"
                      focusBorderColor="blue.500"
                    >
                      {categories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    width="100%"
                    isLoading={loading}
                    loadingText="Adding to Blockchain"
                    borderRadius="lg"
                    boxShadow="md"
                    _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
                    transition="all 0.2s"
                    height="50px"
                    fontSize="md"
                  >
                    Add Expense to Blockchain
                  </Button>
                </VStack>
              </form>
            </CardBody>
          </MotionCard>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            mt={6}
            maxW="600px"
            mx="auto"
          >
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Transaction Notice</Text>
                <Text fontSize="sm">
                  Adding expenses to the blockchain requires a small gas fee. This ensures your transaction is processed securely and permanently.
                </Text>
              </Box>
            </Alert>
          </MotionBox>
        </>
      )}
    </Box>
  );
};

export default AddExpense;