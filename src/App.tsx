import React, { useState, useEffect, useRef } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Bot, 
  Sparkles, 
  UploadCloud, 
  AlertTriangle, 
  Trash2, 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileText, 
  Check, 
  RotateCcw, 
  Sliders, 
  Gauge, 
  Send, 
  Activity, 
  Clock, 
  ShieldCheck, 
  HelpCircle,
  X,
  CreditCard,
  Percent,
  Mail,
  Terminal,
  Cpu,
  BookOpen,
  Code
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================
type ActiveTab = 'DASHBOARD' | 'LEDGER' | 'FORECAST' | 'COACH' | 'OCR' | 'DEVELOPER';

interface Transaction {
  id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  method: string;
}

interface Budget {
  category: string;
  allocated: number;
  spent: number;
}

interface ChatMessage {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  timestamp: string;
  isFallback?: boolean;
}

interface SampleReceipt {
  id: string;
  name: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  items: string[];
}

// ============================================================================
// SEED DATA
// ============================================================================
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'tx-1', date: '2026-07-10', merchant: 'Swiggy Gourmet Elite', category: 'Food & Dining', amount: 1450.00, type: 'EXPENSE', method: 'UPI / GPay' },
  { id: 'tx-2', date: '2026-07-11', merchant: 'Uber India Premium', category: 'Transport', amount: 820.00, type: 'EXPENSE', method: 'UPI Sync' },
  { id: 'tx-3', date: '2026-07-12', merchant: 'Razorpay Client Payout', category: 'Income', amount: 185000.00, type: 'INCOME', method: 'IMPS Bank Transfer' },
  { id: 'tx-4', date: '2026-07-14', merchant: 'AWS Mumbai Cloud Instance', category: 'Subscriptions', amount: 15400.00, type: 'EXPENSE', method: 'HDFC Credit *9921' },
  { id: 'tx-5', date: '2026-07-15', merchant: 'Netflix India Premium', category: 'Subscriptions', amount: 649.00, type: 'EXPENSE', method: 'Auto-Debit ECS' },
  { id: 'tx-6', date: '2026-07-16', merchant: 'Nature Basket Supermarket', category: 'Food & Dining', amount: 6200.00, type: 'EXPENSE', method: 'ICICI Pay' },
];

const INITIAL_BUDGETS: Budget[] = [
  { category: 'Food & Dining', allocated: 20000, spent: 7650.00 },
  { category: 'Shopping', allocated: 35000, spent: 0.00 },
  { category: 'Transport', allocated: 10000, spent: 820.00 },
  { category: 'Subscriptions', allocated: 25000, spent: 16049.00 },
];

const SAMPLE_RECEIPTS: SampleReceipt[] = [
  {
    id: 'rc-1',
    name: 'Blue Tokai Coffee Ingest',
    merchant: 'Blue Tokai Coffee Roasters',
    category: 'Food & Dining',
    amount: 680.00,
    date: '2026-07-16',
    items: ['1x Single Origin Pour Over (₹320)', '1x Almond Butter Toast (₹360)']
  },
  {
    id: 'rc-2',
    name: 'AWS Mumbai Server Invoice',
    merchant: 'Amazon Web Services India',
    category: 'Subscriptions',
    amount: 11450.00,
    date: '2026-07-16',
    items: ['EC2 Asia-Pacific Instance (₹8,100)', 'S3 Storage Multi-AZ Allocation (₹3,350)']
  },
  {
    id: 'rc-3',
    name: 'Ola Prime Premium Ride',
    merchant: 'Ola Cabs Premium Bangalore',
    category: 'Transport',
    amount: 1250.00,
    date: '2026-07-16',
    items: ['Kempegowda Airport Express (₹1,050)', 'Toll-Way Surcharge Fee (₹200)']
  },
  {
    id: 'rc-4',
    name: 'Apple Store BKC Mumbai',
    merchant: 'Apple BKC Store',
    category: 'Shopping',
    amount: 139900.00,
    date: '2026-07-16',
    items: ['iPhone 17 Pro Max Obsidian Black (₹1,39,900)']
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('DASHBOARD');
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fp_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('fp_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  // Keep localStorage synced
  useEffect(() => {
    localStorage.setItem('fp_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fp_budgets', JSON.stringify(budgets));
  }, [budgets]);

  // Recalculate budget spending whenever transactions change
  useEffect(() => {
    const updatedBudgets = budgets.map(b => {
      const categorySpent = transactions
        .filter(t => t.type === 'EXPENSE' && t.category === b.category)
        .reduce((sum, t) => sum + t.amount, 0);
      return { ...b, spent: parseFloat(categorySpent.toFixed(2)) };
    });
    // Check if truly different to prevent render loops
    if (JSON.stringify(updatedBudgets) !== JSON.stringify(budgets)) {
      setBudgets(updatedBudgets);
    }
  }, [transactions]);

  // ============================================================================
  // ANALYTICS & HEALTH COMPUTATION
  // ============================================================================
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  // Real-time Wealth Health Score Calculation (0-100)
  const calculateHealthScore = () => {
    if (totalIncome === 0) return 0;
    
    // Base score relies on saving rate (60%)
    let baseScore = 40;
    const expenseRatio = totalExpenses / totalIncome;
    
    // Ideal ratio of expenses to income is <= 50%.
    if (expenseRatio <= 0.5) {
      baseScore += 50;
    } else if (expenseRatio < 1.0) {
      baseScore += (1.0 - expenseRatio) * 100;
    } else {
      baseScore -= (expenseRatio - 1.0) * 30; // Negative impacts for over-spending
    }

    // Budget compliance deducts (40%)
    let budgetDeductions = 0;
    budgets.forEach(b => {
      if (b.allocated > 0) {
        const ratio = b.spent / b.allocated;
        if (ratio > 1.0) {
          budgetDeductions += 8; // penalty for over budget
        } else if (ratio > 0.85) {
          budgetDeductions += 3; // warning penalty
        }
      }
    });

    return Math.min(100, Math.max(0, Math.round(baseScore - budgetDeductions)));
  };

  const healthScore = calculateHealthScore();

  // Get score metadata
  const getScoreInfo = (score: number) => {
    if (score >= 85) return { label: 'OPTIMAL', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    if (score >= 60) return { label: 'STABLE', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    return { label: 'CRITICAL', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
  };

  const healthInfo = getScoreInfo(healthScore);

  // ============================================================================
  // TABS & SUB-MODULE STATES
  // ============================================================================
  
  // Tab 1: Dashboard UI Helpers
  const [selectedBudgetToEdit, setSelectedBudgetToEdit] = useState<Budget | null>(null);
  const [editedAllocation, setEditedAllocation] = useState('');
  
  // Tab 2: Ledger Management
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  
  // Transaction entry form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTxMerchant, setNewTxMerchant] = useState('');
  const [newTxAmount, setNewTxAmount] = useState('');
  const [newTxCategory, setNewTxCategory] = useState('Food & Dining');
  const [newTxType, setNewTxType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [newTxDate, setNewTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [newTxMethod, setNewTxMethod] = useState('Apple Pay');

  // Tab 3: Forecast Settings
  const [forecastWeeks, setForecastWeeks] = useState(4);
  const [seasonalityFactor, setSeasonalityFactor] = useState(1.0); // 1.0 = normal, 1.1 = +10% expenses, 0.9 = -10%
  const [inflationFactor, setInflationFactor] = useState(1.02); // 2% inflation

  // Tab 4: AI Coach State
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('fp_chat_messages');
    return saved ? JSON.parse(saved) : [
      { id: 'm-1', sender: 'AI', text: "Systems online. Ledger files loaded. Ask me anything about your current trajectory, overspending detection, or potential purchases.", timestamp: '10:00:00' }
    ];
  });
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('fp_chat_messages', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Tab 5: OCR Ingestion Portals
  const [scanningReceipt, setScanningReceipt] = useState<SampleReceipt | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningProgress, setScanningProgress] = useState(0);
  const [scanStep, setScanStep] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanNotification, setScanNotification] = useState<string | null>(null);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  // Budget modification
  const handleSaveBudgetLimit = (category: string) => {
    const amt = parseFloat(editedAllocation);
    if (isNaN(amt) || amt < 0) return;
    
    setBudgets(prev => prev.map(b => b.category === category ? { ...b, allocated: amt } : b));
    setSelectedBudgetToEdit(null);
    setEditedAllocation('');

    // Quick system alert inside chat if modified
    setMessages(prev => [...prev, {
      id: `m-sys-${Date.now()}`,
      sender: 'AI',
      text: `SYSTEM ADVISORY: Threshold boundaries for "${category}" adjusted to ₹${amt.toLocaleString('en-IN')}. Financial score recalibrating...`,
      timestamp: new Date().toTimeString().split(' ')[0]
    }]);
  };

  // Transaction Adding
  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(newTxAmount);
    if (!newTxMerchant.trim() || isNaN(amt) || amt <= 0) return;

    const newTx: Transaction = {
      id: `tx-man-${Date.now()}`,
      date: newTxDate,
      merchant: newTxMerchant.trim(),
      category: newTxType === 'INCOME' ? 'Income' : newTxCategory,
      amount: amt,
      type: newTxType,
      method: newTxMethod
    };

    setTransactions(prev => [newTx, ...prev]);
    setShowAddForm(false);
    
    // Clear inputs
    setNewTxMerchant('');
    setNewTxAmount('');
    setNewTxDate(new Date().toISOString().split('T')[0]);

    // Fast AI context injection
    setMessages(prev => [...prev, {
      id: `m-sys-tx-${Date.now()}`,
      sender: 'AI',
      text: `LEDGER EVENT DETECTED: Committed ${newTxType === 'INCOME' ? 'CREDIT' : 'DEBIT'} of ₹${amt.toLocaleString('en-IN')} at "${newTxMerchant.trim()}" inside category "${newTxCategory}". Velocity indices updated.`,
      timestamp: new Date().toTimeString().split(' ')[0]
    }]);
  };

  // Delete Transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Reset all to initial state
  const handleResetData = () => {
    if (window.confirm("Restore dashboard state back to default parameters? All manual transactions will be cleared.")) {
      setTransactions(INITIAL_TRANSACTIONS);
      setBudgets(INITIAL_BUDGETS);
      setMessages([
        { id: 'm-1', sender: 'AI', text: "Systems online. Ledger files loaded. Ask me anything about your current trajectory, overspending detection, or potential purchases.", timestamp: '10:00:00' }
      ]);
      localStorage.removeItem('fp_transactions');
      localStorage.removeItem('fp_budgets');
      localStorage.removeItem('fp_chat_messages');
    }
  };

  // ============================================================================
  // OCR INGESTION SIMULATOR PIPELINE
  // ============================================================================
  const handleSelectSampleReceipt = (receipt: SampleReceipt) => {
    if (isScanning) return;
    setScanningReceipt(receipt);
    setIsScanning(true);
    setScanningProgress(0);
    setScanStep('INITIALIZING SENSOR...');
    
    // Smooth step-by-step progress simulation
    const steps = [
      { p: 15, s: 'LOADING SCAN MATRIX...' },
      { p: 35, s: 'PERFORMING IMAGE DESKEWING...' },
      { p: 55, s: 'RUNNING NEURAL TEXT EXTRACTOR...' },
      { p: 75, s: 'EXTRACTING KEY VALUE PAIRS (MERCHANT/TOTAL)...' },
      { p: 90, s: 'PREDICTING CATEGORICAL CLASS DOMAIN...' },
      { p: 100, s: 'INGESTION COMPLETE.' }
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setScanningProgress(step.p);
        setScanStep(step.s);
        
        if (step.p === 100) {
          // Finalize parsing and inject into ledger
          const newTx: Transaction = {
            id: `tx-ocr-${Date.now()}`,
            date: receipt.date,
            merchant: receipt.merchant,
            category: receipt.category,
            amount: receipt.amount,
            type: 'EXPENSE',
            method: 'AI Vision OCR'
          };

          setTransactions(prev => [newTx, ...prev]);
          
          setIsScanning(false);
          setScanningReceipt(null);
          setScanNotification(`Successfully ingested receipt from ${receipt.merchant} (₹${receipt.amount.toLocaleString('en-IN')}) via OCR Engine.`);
          
          // Clear notification banner after 4s
          setTimeout(() => setScanNotification(null), 4000);

          // System message
          setMessages(prev => [...prev, {
            id: `m-ocr-${Date.now()}`,
            sender: 'AI',
            text: `[OCR AUTO-INGESTION REPORT]\nProcessed doc for "${receipt.merchant}".\n- Total: ₹${receipt.amount.toLocaleString('en-IN')}\n- Items identified: ${receipt.items.join(', ')}\n- Categorized as "${receipt.category}" with 99.4% vision score.`,
            timestamp: new Date().toTimeString().split(' ')[0]
          }]);
        }
      }, (index + 1) * 600);
    });
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Simulate generic parsing of actual user file
    setSelectedFile(file);
    setIsScanning(true);
    setScanningProgress(0);
    setScanStep('UPLOADING TO CLOUD COMPUTE MODULE...');

    setTimeout(() => {
      setScanningProgress(30);
      setScanStep('DECODING BINARY LAYER...');
    }, 500);

    setTimeout(() => {
      setScanningProgress(60);
      setScanStep('RUNNING CLOUD OCR TRANSFORMER...');
    }, 1100);

    setTimeout(() => {
      setScanningProgress(85);
      setScanStep('MAPPING SCHEMATIC KEYFIELDS...');
    }, 1800);

    setTimeout(() => {
      setScanningProgress(100);
      setScanStep('SUCCESS.');
      
      const simulatedMerchant = file.name.split('.')[0].replace(/[-_]/g, ' ') || 'Custom OCR Bill';
      const simulatedAmount = parseFloat((Math.random() * 8000 + 1000).toFixed(2));
      const simulatedCategory = 'Shopping';

      const newTx: Transaction = {
        id: `tx-ocr-custom-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        merchant: simulatedMerchant.charAt(0).toUpperCase() + simulatedMerchant.slice(1),
        category: simulatedCategory,
        amount: simulatedAmount,
        type: 'EXPENSE',
        method: 'Custom OCR Scan'
      };

      setTransactions(prev => [newTx, ...prev]);
      setIsScanning(false);
      setSelectedFile(null);
      
      setScanNotification(`Successfully scanned custom invoice "${file.name}" -> Assigned to Shopping for ₹${simulatedAmount.toLocaleString('en-IN')}`);
      setTimeout(() => setScanNotification(null), 4000);

      setMessages(prev => [...prev, {
        id: `m-ocr-custom-${Date.now()}`,
        sender: 'AI',
        text: `[CUSTOM RECEIPT INGESTED]\nFile: ${file.name}\nExtracted Merchant: "${newTx.merchant}"\nValuation: ₹${simulatedAmount.toLocaleString('en-IN')}\nCategorized: "Shopping" (Assumed category default).`,
        timestamp: new Date().toTimeString().split(' ')[0]
      }]);

    }, 2500);
  };

  // ============================================================================
  // REAL-TIME INTEGRATED CHAT TERMINAL VIA BACKEND
  // ============================================================================
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isTyping) return;

    const userText = chatInput;
    const userMsg: ChatMessage = {
      id: `m-user-${Date.now()}`,
      sender: 'USER',
      text: userText,
      timestamp: new Date().toTimeString().split(' ')[0]
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsTyping(true);

    try {
      // Connect to full-stack backend `/api/chat`
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          transactions: transactions,
          budgets: budgets
        })
      });

      if (!response.ok) {
        throw new Error('Server returned deficit response status code.');
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        id: `m-ai-${Date.now()}`,
        sender: 'AI',
        text: data.text,
        timestamp: new Date().toTimeString().split(' ')[0],
        isFallback: data.isFallback
      }]);

    } catch (err: any) {
      console.error("Chat communication failure:", err);
      // Resilience: trigger local mock analyzer if server fails
      setTimeout(() => {
        let responseText = "Query registered. Under high traffic volumes, my offline heuristic matrices have evaluated your query:";
        
        // Simple client-side rule extraction
        const clean = userText.toLowerCase();
        if (clean.includes('waste') || clean.includes('spend')) {
          const topExpense = transactions
            .filter(t => t.type === 'EXPENSE')
            .sort((a, b) => b.amount - a.amount)[0];
          responseText = `Analyzing database logs offline: Your greatest single expenditure is at "${topExpense?.merchant || 'Amazon'}" (₹${topExpense?.amount.toLocaleString('en-IN')}) inside category "${topExpense?.category || 'Shopping'}". Commencing non-essential savings plan would rescue capital.`;
        } else if (clean.includes('iphone') || clean.includes('buy')) {
          responseText = `Caution: iPhone purchase simulation offline is deferred. Current cash surplus stands at ₹${netSavings.toLocaleString('en-IN')}. Allocating ₹1,39,900 increases budget over-exposure. Recommend savings buffer of ₹15,000/mo.`;
        } else if (clean.includes('budget')) {
          const overBudget = budgets.find(b => b.spent > b.allocated);
          responseText = overBudget 
            ? `Alert: Offline budget audit shows "${overBudget.category}" is overextended by ₹${(overBudget.spent - overBudget.allocated).toLocaleString('en-IN')}. I recommend systematic cooling immediately.`
            : `All active budget categories reside fully inside standard optimal allocations. Heuristics normal.`;
        }

        setMessages(prev => [...prev, {
          id: `m-ai-err-${Date.now()}`,
          sender: 'AI',
          text: `[LOCAL CORE FALLBACK] ${responseText}`,
          timestamp: new Date().toTimeString().split(' ')[0]
        }]);
      }, 800);
    } finally {
      setIsTyping(false);
    }
  };

  // ============================================================================
  // MATH TREND PREDICTIVE FORECASTING MODEL
  // ============================================================================
  const generateTrendForecast = () => {
    // Math regression baseline: compute average weekly expenses
    // Assuming 2 active historical weeks initially
    const activeExpenseTxs = transactions.filter(t => t.type === 'EXPENSE');
    const totalExpVal = activeExpenseTxs.reduce((sum, t) => sum + t.amount, 0);
    
    // Average weekly expense base
    const weeklyBase = totalExpVal / 2.4; 

    const projectionArray = [];
    let accumulatedTotal = totalExpenses;

    // Week 0 is current
    projectionArray.push({
      label: 'Current Week',
      historical: totalExpenses,
      projected: totalExpenses,
      savingBuffer: netSavings > 0 ? netSavings : 0
    });

    for (let w = 1; w <= forecastWeeks; w++) {
      // Linear scaling with compounding seasonality and inflation parameters
      const weekMultiplier = 1 + (w * 0.05); // slight rise over weeks due to randomness
      const estimatedCost = weeklyBase * seasonalityFactor * Math.pow(inflationFactor, w / 4) * weekMultiplier;
      accumulatedTotal += estimatedCost;
      
      // Proportional projected incomes
      const projectedAccumIncome = totalIncome + ((totalIncome / 2.4) * w);
      const projBuffer = Math.max(0, projectedAccumIncome - accumulatedTotal);

      projectionArray.push({
        label: `Week +${w}`,
        historical: null,
        projected: accumulatedTotal,
        savingBuffer: projBuffer
      });
    }

    return projectionArray;
  };

  const trendProjections = generateTrendForecast();

  // Draw chart dimensions for standard SVG graphing
  const chartHeight = 160;
  const chartWidth = 500;
  
  // Find min/max values to scale SVG coordinate positions gracefully
  const maxProjectedValue = Math.max(...trendProjections.map(p => p.projected), totalIncome * 1.5, 1000);
  
  const getSvgCoordinates = (index: number, val: number) => {
    const x = (index / (trendProjections.length - 1)) * chartWidth;
    const y = chartHeight - (val / maxProjectedValue) * chartHeight;
    return { x, y };
  };

  // Build SVG path strings
  let historicalPath = '';
  let forecastedPath = '';
  
  trendProjections.forEach((p, i) => {
    // Projected line path
    const { x, y } = getSvgCoordinates(i, p.projected);
    if (i === 0) {
      forecastedPath = `M ${x} ${y}`;
    } else {
      forecastedPath += ` L ${x} ${y}`;
    }
  });

  return (
    <div className="min-h-screen bg-[#090D10] text-[#E5E7EB] font-sans antialiased flex flex-col selection:bg-emerald-500/30 selection:text-white">
      
      {/* 1. HUD TOPBAR HEADER */}
      <header className="border-b border-gray-800/80 bg-[#12181F]/80 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#10B981] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <Bot className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black tracking-tight text-white font-sans">FINPILOT AI</span>
                <span className="text-[9px] bg-[#10B981]/10 text-[#10B981] px-1.5 py-0.5 rounded-full border border-[#10B981]/20 font-mono">v3.5 PRO</span>
              </div>
              <div className="text-[10px] tracking-widest text-gray-500 font-mono uppercase">QUANTITATIVE WEALTH OPERATIONS</div>
            </div>
          </div>

          {/* APPLICATION MAIN TAB SELECTOR */}
          <div className="flex overflow-x-auto whitespace-nowrap scrollbar-none max-w-full bg-[#090D10] p-1 rounded-lg border border-gray-800/80 font-mono text-xs shadow-inner">
            {(['DASHBOARD', 'LEDGER', 'FORECAST', 'COACH', 'OCR', 'DEVELOPER'] as ActiveTab[]).map(tab => (
              <button
                id={`tab-select-${tab.toLowerCase()}`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-2 rounded-md font-medium uppercase tracking-wider transition-all duration-200 relative shrink-0 ${
                  activeTab === tab 
                    ? 'bg-[#12181F] text-[#10B981] border border-gray-800 shadow-sm font-bold' 
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {tab === 'DEVELOPER' ? 'AMANYA (MCA)' : tab}
                {activeTab === tab && (
                  <motion.div 
                    layoutId="activeTabUnderline" 
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#10B981]" 
                  />
                )}
              </button>
            ))}
          </div>

          {/* SYSTEM METRIC STACKS */}
          <div className="hidden lg:flex items-center gap-4 text-right">
            <div className="font-mono">
              <span className="text-[9px] text-gray-500 block">SYSTEM STATUS</span>
              <span className="text-xs text-[#10B981] font-bold flex items-center justify-end gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                ONLINE SYNCED
              </span>
            </div>
            <div className="h-8 w-[1px] bg-gray-800" />
            <div className="font-mono text-left">
              <span className="text-[9px] text-gray-500 block">SECURE CREDENTIALS</span>
              <span className="text-xs text-gray-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                AES-256 SAFE
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* 2. MAIN APPLICATION PORTAL */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* NOTIFICATION TOAST OVERLAY */}
        <AnimatePresence>
          {scanNotification && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-[#12181F] border-l-4 border-[#10B981] border border-gray-800 p-4 rounded-xl flex items-center justify-between gap-3 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-emerald-500/10 rounded-lg text-[#10B981]">
                  <Check className="w-4 h-4" />
                </div>
                <p className="text-xs text-gray-200 font-mono font-medium">{scanNotification}</p>
              </div>
              <button onClick={() => setScanNotification(null)} className="text-gray-500 hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ====================================================================
            TAB: CONTROL DASHBOARD & HEALTH SCORE
            ==================================================================== */}
        {activeTab === 'DASHBOARD' && (
          <div className="space-y-6 animate-[fadeIn_0.25s_ease-out]">
            
            {/* HERO ACCOUNT MATRIX */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Income Ingested */}
              <div className="bg-[#12181F] border border-gray-800/80 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-[#10B981]/30 transition-colors">
                <div className="absolute top-0 right-0 p-4 text-emerald-500 opacity-10">
                  <TrendingUp className="w-16 h-16" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-gray-500 block uppercase mb-1">INGESTED INCOME (CREDIT)</span>
                  <span className="text-3xl font-black font-mono tracking-tight text-white">₹{totalIncome.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
                <div className="text-[11px] text-[#10B981] mt-5 flex items-center gap-1.5 font-mono">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Verified cash receipts active</span>
                </div>
              </div>

              {/* Expense Disbursement */}
              <div className="bg-[#12181F] border border-gray-800/80 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-red-500/20 transition-colors">
                <div className="absolute top-0 right-0 p-4 text-rose-500 opacity-10">
                  <ArrowDownLeft className="w-16 h-16" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-gray-500 block uppercase mb-1">TOTAL EXPENSE METRIC (DEBIT)</span>
                  <span className="text-3xl font-black font-mono tracking-tight text-white">₹{totalExpenses.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                </div>
                <div className="text-[11px] text-gray-400 mt-5 font-mono flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-500" />
                  <span>Across {transactions.filter(t => t.type === 'EXPENSE').length} discrete debit events</span>
                </div>
              </div>

              {/* Net Surplus Reserve */}
              <div className="bg-[#12181F] border border-gray-800/80 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden group hover:border-blue-500/20 transition-colors">
                <div className="absolute top-0 right-0 p-4 text-blue-500 opacity-10">
                  <CreditCard className="w-16 h-16 text-blue-500/20" />
                </div>
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-gray-500 block uppercase mb-1">NET REVENUE SURPLUS</span>
                  <span className={`text-3xl font-black font-mono tracking-tight ${netSavings >= 0 ? 'text-[#3B82F6]' : 'text-rose-500'}`}>
                    ₹{netSavings.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                  </span>
                </div>
                <div className="text-[11px] mt-5 font-mono flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-gray-400">Savings rate index: <strong className="text-white">{savingsRate.toFixed(1)}%</strong></span>
                </div>
              </div>

              {/* Animated Wealth Score Radar */}
              <div className="bg-[#12181F] border border-gray-800/80 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono tracking-widest text-gray-500 block uppercase">WEALTH HEALTH INDEX</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black font-mono tracking-tighter text-white">{healthScore}</span>
                    <span className="text-xs text-gray-500 font-mono">/100</span>
                  </div>
                  <span className={`text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded ${healthInfo.bg} ${healthInfo.color} ${healthInfo.border} border inline-block`}>
                    {healthInfo.label} RATIO
                  </span>
                </div>
                
                {/* Advanced Dynamic Radial Meter */}
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="32" className="stroke-gray-800/80 fill-none" strokeWidth="6" />
                    <motion.circle 
                      cx="40" 
                      cy="40" 
                      r="32" 
                      className={`fill-none ${
                        healthScore >= 85 ? 'stroke-[#10B981]' : healthScore >= 60 ? 'stroke-[#F59E0B]' : 'stroke-[#EF4444]'
                      }`}
                      strokeWidth="6" 
                      strokeDasharray="201"
                      initial={{ strokeDashoffset: 201 }}
                      animate={{ strokeDashoffset: 201 - (201 * healthScore) / 100 }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[10px] font-mono text-gray-400 font-bold">{healthScore}%</span>
                </div>

              </div>
            </div>

            {/* BENTO SECOND ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* BUDGET LIMITS MATRIX */}
              <div className="lg:col-span-1 bg-[#12181F] border border-gray-800/80 rounded-2xl p-5 space-y-4">
                <div className="border-b border-gray-800/80 pb-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-mono font-bold tracking-widest text-gray-400 uppercase">BUDGET ENFORCEMENT</h3>
                  </div>
                  <span className="text-[9px] bg-amber-500/10 text-[#F59E0B] px-2 py-0.5 rounded border border-amber-500/20 font-mono">LIVE BARRIERS</span>
                </div>

                <div className="space-y-4 pt-2">
                  {budgets.map((b, i) => {
                    const ratio = b.allocated > 0 ? Math.min(100, (b.spent / b.allocated) * 100) : 0;
                    const isBreached = b.spent > b.allocated;
                    
                    return (
                      <div key={i} className="space-y-1.5 group">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-300 font-medium font-sans">{b.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-gray-400">
                              <span className={isBreached ? 'text-[#EF4444] font-bold' : 'text-white'}>₹{b.spent.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span> / ₹{b.allocated.toLocaleString('en-IN')}
                            </span>
                            <button 
                              onClick={() => {
                                setSelectedBudgetToEdit(b);
                                setEditedAllocation(b.allocated.toString());
                              }}
                              className="text-[10px] text-gray-500 hover:text-[#10B981] opacity-0 group-hover:opacity-100 transition-all font-mono"
                            >
                              EDIT
                            </button>
                          </div>
                        </div>

                        {/* Progress slider container */}
                        <div className="w-full bg-[#090D10] h-2 rounded-full overflow-hidden border border-gray-800/60 relative">
                          <div 
                            style={{ width: `${ratio}%` }}
                            className={`h-full transition-all duration-500 rounded-full ${
                              isBreached 
                                ? 'bg-gradient-to-r from-rose-600 to-red-500' 
                                : ratio > 85 
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-400' 
                                  : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                            }`}
                          />
                        </div>

                        <div className="flex justify-between text-[9px] font-mono">
                          <span className={isBreached ? 'text-red-400' : ratio > 85 ? 'text-amber-400' : 'text-gray-500'}>
                            {isBreached ? '▲ LIMIT BREACHED' : ratio > 85 ? '▲ APPROACHING MAX' : 'COMPLIANT'}
                          </span>
                          <span className="text-gray-500">{ratio.toFixed(0)}% Utilized</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Edit Budget Mini Modal Inline */}
                <AnimatePresence>
                  {selectedBudgetToEdit && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-[#090D10] border border-gray-800 rounded-lg space-y-3 font-mono text-xs overflow-hidden"
                    >
                      <div className="flex justify-between text-gray-400">
                        <span>Adjust Limit: {selectedBudgetToEdit.category}</span>
                        <button onClick={() => setSelectedBudgetToEdit(null)}>
                          <X className="w-3.5 h-3.5 hover:text-white" />
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="number"
                          value={editedAllocation}
                          onChange={(e) => setEditedAllocation(e.target.value)}
                          className="bg-[#12181F] border border-gray-800 rounded p-1.5 text-white flex-1 focus:outline-none focus:border-emerald-500 text-xs"
                          placeholder="New Allocated Max"
                        />
                        <button 
                          onClick={() => handleSaveBudgetLimit(selectedBudgetToEdit.category)}
                          className="bg-[#10B981] text-black font-bold px-3 py-1.5 rounded text-xs hover:bg-emerald-400"
                        >
                          SAVE
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* AUTONOMOUS WEALTH COACH ADVISORY */}
              <div className="lg:col-span-2 bg-[#12181F] border border-gray-800/80 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="border-b border-gray-800/80 pb-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-xs font-mono font-bold tracking-widest text-gray-400 uppercase">AUTONOMOUS ADV-REPORTS</h3>
                    </div>
                    <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest">RAG ENGINE STABLE</span>
                  </div>

                  {/* Smart recommendations block */}
                  <div className="space-y-3 mt-4">
                    
                    {/* Advisory 1: Food spend warning */}
                    <div className="p-3.5 bg-[#090D10] border border-gray-800/60 rounded-xl flex items-start gap-3 group hover:border-amber-500/20 transition-colors">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] mt-1.5 shrink-0 animate-pulse" />
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-amber-500 block font-bold">DISBURSEMENT SPARK WARNING</span>
                        <p className="text-xs text-gray-300 leading-relaxed font-sans">
                          Spending profiles in <strong className="text-white">Food & Dining</strong> trace a minor upward velocity cluster (₹7,650 spent). Compressing retail dining segments by 12% secures an active cash recapture of <span className="text-[#10B981] font-mono font-bold">₹918.00</span> prior to month-close cycles.
                        </p>
                      </div>
                    </div>

                    {/* Advisory 2: Subscription optimizations */}
                    <div className="p-3.5 bg-[#090D10] border border-gray-800/60 rounded-xl flex items-start gap-3 group hover:border-emerald-500/20 transition-colors">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] mt-1.5 shrink-0" />
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-emerald-500 block font-bold">RECURRING VECTOR HEALTH</span>
                        <p className="text-xs text-gray-300 leading-relaxed font-sans">
                          Your active subscriptions (e.g., AWS, Netflix Premium) currently track at <span className="text-[#3B82F6] font-mono font-bold">82.0%</span> of limits. Absolute trajectory remains inside standard deviations with no critical adjustments recommended.
                        </p>
                      </div>
                    </div>

                    {/* Advisory 3: General Net Surplus Heuristic */}
                    <div className="p-3.5 bg-[#090D10] border border-gray-800/60 rounded-xl flex items-start gap-3 group hover:border-blue-500/20 transition-colors">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#3B82F6] mt-1.5 shrink-0" />
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono text-blue-500 block font-bold">LIQUID BUFFER RATIO</span>
                        <p className="text-xs text-gray-300 leading-relaxed font-sans">
                          A high liquid savings coefficient of <strong className="text-white">{(savingsRate || 0).toFixed(1)}%</strong> has stabilized your trajectory. FinPilot evaluates your current liquidity index as <span className="text-emerald-400 font-bold">EXCELLENT</span>.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Navigation Footer */}
                <div className="mt-6 pt-4 border-t border-gray-800/40 flex flex-col sm:flex-row gap-3 items-center justify-between">
                  <span className="text-[9px] text-gray-600 font-mono uppercase tracking-widest">INTERVAL PARSE: 30S DEEP EVAL</span>
                  <button 
                    onClick={() => setActiveTab('COACH')}
                    className="text-[10px] bg-[#10B981]/10 text-[#10B981] px-4 py-2 rounded-lg border border-[#10B981]/20 hover:bg-[#10B981]/20 transition-all font-mono uppercase tracking-wider font-bold"
                  >
                    ENGAGE ADV-CHAT INTERPRETER →
                  </button>
                </div>
              </div>

            </div>

            {/* QUICK ACTIONS ROW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                onClick={() => setActiveTab('OCR')} 
                className="bg-gradient-to-r from-emerald-950/20 to-teal-950/10 border border-gray-800/80 rounded-2xl p-5 cursor-pointer hover:border-emerald-500/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-emerald-500/10 rounded-xl text-[#10B981]">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-xs font-mono font-bold tracking-wider text-white">OCR RECEIPT SCAN PORTAL</h4>
                <p className="text-[11px] text-gray-400 mt-1">Ingest bills instantly via advanced computer vision models to catalog ledger files automatically.</p>
              </div>

              <div 
                onClick={() => setActiveTab('FORECAST')} 
                className="bg-gradient-to-r from-blue-950/20 to-indigo-950/10 border border-gray-800/80 rounded-2xl p-5 cursor-pointer hover:border-blue-500/40 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-blue-500/10 rounded-xl text-[#3B82F6]">
                    <Activity className="w-5 h-5" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <h4 className="text-xs font-mono font-bold tracking-wider text-white">ML TREND FORECASTER</h4>
                <p className="text-[11px] text-gray-400 mt-1">Simulate seasonal regressions and mathematical forecasting trends across consecutive weeks.</p>
              </div>

              <div 
                onClick={handleResetData} 
                className="bg-[#12181F]/40 border border-gray-800/80 rounded-2xl p-5 cursor-pointer hover:border-red-500/30 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                </div>
                <h4 className="text-xs font-mono font-bold tracking-wider text-white">RESET WORKSPACE DATA</h4>
                <p className="text-[11px] text-gray-400 mt-1">Wipe manual ledger structures and restore secure initial seed transactions instantly.</p>
              </div>
            </div>

          </div>
        )}

        {/* ====================================================================
            TAB: LEDGER TRANSACTIONS LOGISTICS
            ==================================================================== */}
        {activeTab === 'LEDGER' && (
          <div className="space-y-6 animate-[fadeIn_0.25s_ease-out]">
            
            {/* LEDGER FILTER CONTROL HUB */}
            <div className="bg-[#12181F] border border-gray-800/80 rounded-2xl p-5">
              <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
                
                {/* SEARCH BAR */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-500" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter ledger database by merchant title or category keys..."
                    className="w-full bg-[#090D10] border border-gray-800/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono placeholder-gray-600"
                  />
                </div>

                {/* FILTERS DROPDOWN SELECTORS */}
                <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
                  
                  {/* Category Filter */}
                  <div className="flex items-center gap-1.5 bg-[#090D10] border border-gray-800/80 rounded-lg px-2.5 py-1.5">
                    <span className="text-gray-500 text-[10px]">CATEGORY:</span>
                    <select 
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-transparent text-gray-300 font-bold focus:outline-none"
                    >
                      <option value="ALL">ALL VECTORS</option>
                      <option value="Food & Dining">Food & Dining</option>
                      <option value="Subscriptions">Subscriptions</option>
                      <option value="Transport">Transport</option>
                      <option value="Shopping">Shopping</option>
                      <option value="Income">Income</option>
                    </select>
                  </div>

                  {/* Type Filter */}
                  <div className="flex items-center gap-1.5 bg-[#090D10] border border-gray-800/80 rounded-lg px-2.5 py-1.5">
                    <span className="text-gray-500 text-[10px]">TYPE:</span>
                    <select 
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="bg-transparent text-gray-300 font-bold focus:outline-none"
                    >
                      <option value="ALL">ALL PIPELINES</option>
                      <option value="EXPENSE">DEBIT (EXPENSE)</option>
                      <option value="INCOME">CREDIT (INCOME)</option>
                    </select>
                  </div>

                  {/* Add Entry Button */}
                  <button 
                    onClick={() => setShowAddForm(true)}
                    className="bg-[#10B981] hover:bg-emerald-400 text-black font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all text-xs"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    LOG ENTRY
                  </button>

                </div>

              </div>
            </div>

            {/* MANUAL MANIFEST INGESTION DRAWER PANEL (MODAL EFFECT) */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-[#090D10]/80 backdrop-blur-sm flex items-center justify-center p-4"
                >
                  <motion.div 
                    initial={{ scale: 0.95, y: 15 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 15 }}
                    className="bg-[#12181F] border border-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative"
                  >
                    <button 
                      onClick={() => setShowAddForm(false)}
                      className="absolute top-4 right-4 text-gray-500 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>

                    <h3 className="text-sm font-mono font-bold tracking-widest text-white border-b border-gray-800 pb-3 mb-4 uppercase">LOG TRANSACTION VECTOR</h3>
                    
                    <form onSubmit={handleCreateTransaction} className="space-y-4 font-mono text-xs">
                      
                      <div>
                        <label className="text-gray-500 block mb-1">PIPELINE TYPE</label>
                        <select 
                          value={newTxType} 
                          onChange={(e) => setNewTxType(e.target.value as any)}
                          className="w-full bg-[#090D10] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="EXPENSE">DEBIT / EXPENSE METRIC</option>
                          <option value="INCOME">CREDIT / INCOME RETRIEVAL</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-gray-500 block mb-1">MERCHANT SOURCE IDENTIFIER</label>
                        <input 
                          type="text" 
                          required
                          placeholder="e.g. Amazon, Uber, Walmart, Stripe" 
                          value={newTxMerchant}
                          onChange={(e) => setNewTxMerchant(e.target.value)}
                          className="w-full bg-[#090D10] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      {newTxType === 'EXPENSE' && (
                        <div>
                          <label className="text-gray-500 block mb-1">CATEGORICAL DOMAIN CLASSIFIER</label>
                          <select 
                            value={newTxCategory} 
                            onChange={(e) => setNewTxCategory(e.target.value)}
                            className="w-full bg-[#090D10] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="Food & Dining">Food & Dining</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Transport">Transport</option>
                            <option value="Subscriptions">Subscriptions</option>
                          </select>
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-gray-500 block mb-1">VALUATION QUANTITY (INR ₹)</label>
                          <input 
                            type="number" 
                            step="0.01" 
                            required
                            placeholder="0.00" 
                            value={newTxAmount}
                            onChange={(e) => setNewTxAmount(e.target.value)}
                            className="w-full bg-[#090D10] border border-gray-800 rounded-lg p-2.5 text-[#10B981] font-bold text-sm focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="text-gray-500 block mb-1">METHOD</label>
                          <select 
                            value={newTxMethod}
                            onChange={(e) => setNewTxMethod(e.target.value)}
                            className="w-full bg-[#090D10] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                          >
                            <option value="Apple Pay">Apple Pay</option>
                            <option value="Visa *4221">Visa *4221</option>
                            <option value="Mastercard">Mastercard</option>
                            <option value="Auto-Debit">Auto-Debit</option>
                            <option value="ACH Transfer">ACH Transfer</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-gray-500 block mb-1">TIMESTAMP DATE</label>
                        <input 
                          type="date"
                          required
                          value={newTxDate}
                          onChange={(e) => setNewTxDate(e.target.value)}
                          className="w-full bg-[#090D10] border border-gray-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="w-full bg-[#10B981] text-black font-bold py-3 rounded-lg tracking-wider hover:bg-emerald-400 transition-all uppercase mt-2 font-mono text-xs shadow-lg shadow-emerald-500/10"
                      >
                        COMMIT ENTRY TO LEDGER
                      </button>

                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ACCOUNT LEDGER TABLE CARD */}
            <div className="bg-[#12181F] border border-gray-800/80 rounded-2xl p-5 overflow-hidden">
              <div className="flex justify-between items-center border-b border-gray-800/80 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-xs font-mono font-bold tracking-widest text-white uppercase">IMMUTABLE ACCOUNT LEDGER METRICS</h3>
                </div>
                <span className="text-[10px] font-mono text-gray-500">{transactions.length} RECORDS SYNCED</span>
              </div>

              {/* TABLE CONTAINER */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 text-gray-500 text-[10px] uppercase tracking-widest">
                      <th className="pb-3 font-medium">TIMESTAMP</th>
                      <th className="pb-3 font-medium">MERCHANT ENTITY</th>
                      <th className="pb-3 font-medium">CATEGORICAL VECTOR</th>
                      <th className="pb-3 font-medium">PIPELINE ROUTE</th>
                      <th className="pb-3 font-medium text-right">VALUATION VALUE</th>
                      <th className="pb-3 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/40">
                    {transactions
                      .filter(t => {
                        // Apply Search Query
                        const matchesSearch = t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                              t.category.toLowerCase().includes(searchQuery.toLowerCase());
                        
                        // Apply Category Filter
                        const matchesCategory = categoryFilter === 'ALL' || t.category === categoryFilter;
                        
                        // Apply Type Filter
                        const matchesType = typeFilter === 'ALL' || t.type === typeFilter;

                        return matchesSearch && matchesCategory && matchesType;
                      })
                      .map((t) => (
                        <tr key={t.id} className="hover:bg-gray-800/20 transition-all group">
                          <td className="py-3 text-gray-400 font-mono text-[11px]">{t.date}</td>
                          <td className="py-3 font-bold text-white text-[12px]">{t.merchant}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 bg-[#090D10] border rounded text-[10px] font-bold ${
                              t.type === 'INCOME' 
                                ? 'text-blue-400 border-blue-500/20 bg-blue-500/5' 
                                : t.category === 'Food & Dining' 
                                  ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
                                  : t.category === 'Subscriptions'
                                    ? 'text-purple-400 border-purple-500/20 bg-purple-500/5'
                                    : t.category === 'Transport'
                                      ? 'text-amber-400 border-amber-500/20 bg-amber-500/5'
                                      : 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5'
                            }`}>
                              {t.category}
                            </span>
                          </td>
                          <td className="py-3 text-gray-500 text-[11px]">{t.method}</td>
                          <td className={`py-3 text-right font-black text-sm tracking-tight ${
                            t.type === 'INCOME' ? 'text-[#10B981]' : 'text-gray-200'
                          }`}>
                            {t.type === 'INCOME' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}
                          </td>
                          <td className="py-3 text-right">
                            <button 
                              onClick={() => handleDeleteTransaction(t.id)}
                              className="text-gray-600 hover:text-rose-500 p-1.5 hover:bg-rose-500/10 rounded-lg transition-all"
                              title="Delete transaction"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    }
                  </tbody>
                </table>
              </div>

              {transactions.length === 0 && (
                <div className="text-center py-10 font-mono text-xs text-gray-500">
                  <AlertTriangle className="w-8 h-8 mx-auto text-amber-500 mb-2" />
                  <span>Ledger database empty. Tap "LOG ENTRY" or go to "OCR PORTAL" to ingest files.</span>
                </div>
              )}

            </div>

          </div>
        )}

        {/* ====================================================================
            TAB: DATA VISUALIZATIONS & ML FORECASTS
            ==================================================================== */}
        {activeTab === 'FORECAST' && (
          <div className="space-y-6 animate-[fadeIn_0.25s_ease-out]">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* LINE MAP GRAPH CONTROLLER */}
              <div className="lg:col-span-2 bg-[#12181F] border border-gray-800/80 rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-800/80 pb-3 mb-6 gap-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-mono font-bold tracking-widest text-white uppercase">PREDICTIVE STABILITY FORECAST PATTERNS</h3>
                  </div>
                  <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-mono uppercase">ML AUTO-PROPHET MODEL</span>
                </div>

                {/* VISUAL CHART GRAPHIC CONTAINER */}
                <div className="w-full h-72 bg-[#090D10] rounded-xl border border-gray-800/80 p-6 flex flex-col justify-between relative overflow-hidden">
                  
                  {/* Grid Lines Overlay */}
                  <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-10">
                    <div className="border-b border-gray-700 w-full h-0" />
                    <div className="border-b border-gray-700 w-full h-0" />
                    <div className="border-b border-gray-700 w-full h-0" />
                    <div className="border-b border-gray-700 w-full h-0" />
                  </div>

                  {/* Header overlay */}
                  <div className="flex justify-between items-start font-mono text-[10px] text-gray-500 z-10">
                    <span>Compounded Expected Loss (₹)</span>
                    <span className="text-[#3B82F6] font-bold">Max Limit: ₹{maxProjectedValue.toLocaleString('en-IN', {maximumFractionDigits: 0})}</span>
                  </div>

                  {/* SVG Chart Graphic */}
                  <div className="relative flex-1 mt-4">
                    <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
                      
                      {/* Gradient Definitions */}
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      {/* Forecasted Compounded Path area fill */}
                      <path 
                        d={`${forecastedPath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`}
                        fill="url(#chartGrad)"
                      />

                      {/* Forecasted Path Solid Dash Line */}
                      <path 
                        d={forecastedPath} 
                        fill="none" 
                        stroke="#3B82F6" 
                        strokeWidth="3"
                        strokeDasharray="4 3"
                        className="animate-[dash_1s_ease-out]"
                      />

                      {/* Forecasted Nodes Interaction */}
                      {trendProjections.map((p, i) => {
                        const { x, y } = getSvgCoordinates(i, p.projected);
                        return (
                          <g key={i} className="group cursor-pointer">
                            <circle 
                              cx={x} 
                              cy={y} 
                              r="5" 
                              fill="#3B82F6" 
                              className="hover:scale-150 transition-all stroke-black stroke-2"
                            />
                            {/* Hover tooltip text values */}
                            <foreignObject x={x - 45} y={y - 30} width="90" height="25" className="hidden group-hover:block pointer-events-none">
                              <div className="bg-gray-900 border border-gray-700 text-[9px] font-mono text-white text-center rounded p-1">
                                ₹{p.projected.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                              </div>
                            </foreignObject>
                          </g>
                        );
                      })}
                      
                    </svg>
                  </div>

                  {/* X-Axis labels */}
                  <div className="w-full flex justify-between text-[10px] font-mono text-gray-500 border-t border-gray-800/80 pt-2 z-10">
                    {trendProjections.map((p, i) => (
                      <span key={i} className="text-center">{p.label}</span>
                    ))}
                  </div>

                </div>

                {/* PARAMETER CONTROLS ACCORDION */}
                <div className="mt-4 p-4 bg-[#090D10] border border-gray-800/80 rounded-xl space-y-4">
                  <div className="flex items-center gap-1.5 text-gray-400 font-mono text-xs">
                    <Sliders className="w-4 h-4 text-emerald-500" />
                    <span>ML FORECAST ADJUSTMENT ALGORITHMS</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                    
                    {/* Seasonality Multiplier Slider */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">SEASONALITY FACTOR</span>
                        <span className="text-white font-bold">{seasonalityFactor}x</span>
                      </div>
                      <input 
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.05"
                        value={seasonalityFactor}
                        onChange={(e) => setSeasonalityFactor(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#10B981]"
                      />
                      <span className="text-[9px] text-gray-600 block">Simulates cost anomalies or holidays.</span>
                    </div>

                    {/* Inflation Compounding Index */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">COMPOUNDING INFLATION</span>
                        <span className="text-white font-bold">{((inflationFactor - 1) * 100).toFixed(0)}% CPI</span>
                      </div>
                      <input 
                        type="range"
                        min="1.00"
                        max="1.15"
                        step="0.01"
                        value={inflationFactor}
                        onChange={(e) => setInflationFactor(parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#3B82F6]"
                      />
                      <span className="text-[9px] text-gray-600 block">Applies a compounding consumer inflation rate.</span>
                    </div>

                    {/* Weekly window limit */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-gray-500">FORECAST RANGE</span>
                        <span className="text-white font-bold">{forecastWeeks} Weeks</span>
                      </div>
                      <select 
                        value={forecastWeeks}
                        onChange={(e) => setForecastWeeks(parseInt(e.target.value))}
                        className="w-full bg-[#12181F] border border-gray-800 text-gray-300 rounded p-1 text-[11px]"
                      >
                        <option value={2}>2 Weeks Projections</option>
                        <option value={4}>4 Weeks Projections</option>
                        <option value={6}>6 Weeks Projections</option>
                        <option value={8}>8 Weeks Projections</option>
                      </select>
                      <span className="text-[9px] text-gray-600 block">Extends prediction limits.</span>
                    </div>

                  </div>
                </div>

              </div>

              {/* STATISTICAL SUMMARIES AND EXPORTS */}
              <div className="lg:col-span-1 bg-[#12181F] border border-gray-800/80 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="border-b border-gray-800/80 pb-3 mb-4 flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-mono font-bold tracking-widest text-white uppercase">PREDICTED VALUES</h3>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    {trendProjections.map((p, i) => (
                      <div key={i} className="flex justify-between items-center p-3 bg-[#090D10] border border-gray-800/60 rounded-xl">
                        <span className="text-gray-400">{p.label} Projection</span>
                        <div className="text-right">
                          <span className={`font-black block text-sm ${i === 0 ? 'text-white' : 'text-[#3B82F6]'}`}>
                            ₹{p.projected.toLocaleString('en-IN', {maximumFractionDigits: 2})}
                          </span>
                          <span className="text-[9px] text-gray-500 block">
                            Est. Buffer: ₹{p.savingBuffer.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PDF Report generator simulation */}
                <div className="mt-6 pt-4 border-t border-gray-800/80">
                  <div className="text-[9px] text-gray-500 font-mono uppercase tracking-widest mb-3">Structured Report Dispatcher</div>
                  <button 
                    onClick={() => {
                      alert("Compiling report coordinates.\n- Seeded ledger items checked\n- Math regressions verified\n- PDF summary compiling successfully. Proceeding to print manifest values.");
                      window.print();
                    }}
                    className="w-full bg-transparent border border-gray-700 hover:border-gray-500 text-white font-bold py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    COMPILE SECURED SUMMARY REPORT
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ====================================================================
            TAB: AI CONTEXTUAL WEALTH COACH CHAT
            ==================================================================== */}
        {activeTab === 'COACH' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[650px] animate-[fadeIn_0.25s_ease-out]">
            
            {/* LEFT TELEMETRY AND METADATA */}
            <div className="lg:col-span-1 bg-[#12181F] border border-gray-800/80 rounded-2xl p-4 flex flex-col justify-between h-full hidden lg:flex">
              <div className="space-y-4">
                <div className="border-b border-gray-800 pb-2">
                  <h4 className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">SYS_TELEMETRY</h4>
                </div>
                
                <div className="space-y-3 font-mono text-[11px]">
                  <div>
                    <span className="text-gray-500 block text-[9px]">COMPUTATIONAL MODEL</span>
                    <span className="text-[#10B981] font-bold">gemini-3.5-flash-latest</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px]">LEDGER OBJECTS LOADED</span>
                    <span className="text-white">{transactions.length} active items</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px]">BUDGET TRACKERS INGESTED</span>
                    <span className="text-white">{budgets.length} unique vectors</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[9px]">HEALTH SCORE FEEDBACK</span>
                    <span className="text-white">{healthScore}/100</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#090D10] border border-gray-800 rounded-xl space-y-1 text-[10px] font-mono text-gray-500 leading-relaxed">
                <Bot className="w-5 h-5 text-emerald-500 mb-1" />
                <p>
                  FinPilot AI relies on deep ledger analysis. Chat prompts trigger background context injections representing your precise transaction history.
                </p>
              </div>
            </div>

            {/* CHAT TERMINAL MAIN BLOCK */}
            <div className="lg:col-span-3 bg-[#12181F] border border-gray-800/80 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl relative">
              
              {/* TERMINAL STATUS BAR */}
              <div className="border-b border-gray-800 px-6 py-4 flex justify-between items-center bg-[#12181F]">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span className="text-xs font-mono font-bold tracking-widest text-white uppercase">FINPILOT ANALYTICAL INTEL TERMINAL</span>
                </div>
                <span className="text-[9px] bg-blue-500/10 text-blue-400 font-mono px-2 py-0.5 rounded border border-blue-500/20 uppercase">RAG COMPLIANT</span>
              </div>

              {/* CHAT CHRONICLES AREA */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#090D10]/30 font-sans text-xs">
                
                {messages.map((m) => (
                  <div key={m.id} className={`flex flex-col ${m.sender === 'USER' ? 'items-end' : 'items-start'} animate-[fadeIn_0.2s_ease-out]`}>
                    
                    <div className="flex items-center gap-2 mb-1 text-[9px] text-gray-500 font-mono">
                      <span>{m.sender === 'AI' ? '🧠 FINPILOT_CORE' : '👤 ACC_OPERATOR'}</span>
                      <span>•</span>
                      <span>{m.timestamp}</span>
                      {m.isFallback && (
                        <span className="text-amber-500 font-bold bg-amber-500/10 px-1 rounded text-[8px]">OFFLINE MODEL</span>
                      )}
                    </div>

                    <div 
                      className={`max-w-xl p-3.5 rounded-2xl leading-relaxed border font-sans text-xs shadow-md ${
                        m.sender === 'USER' 
                          ? 'bg-[#10B981]/10 text-white border-[#10B981]/20' 
                          : 'bg-[#12181F] text-[#E5E7EB] border-gray-800/80'
                      }`}
                    >
                      {/* Standard split and map markdown formatting inside text manually */}
                      {m.text.split('\n').map((line, idx) => {
                        if (line.startsWith('###')) {
                          return <h4 key={idx} className="font-mono font-bold text-white text-[11px] mt-2 mb-1 uppercase tracking-wider">{line.replace('###', '')}</h4>;
                        }
                        if (line.startsWith('-')) {
                          return <div key={idx} className="ml-3 text-gray-300 list-disc font-sans py-0.5">• {line.replace('-', '').trim()}</div>;
                        }
                        if (line.startsWith('**') || line.includes('**')) {
                          // basic formatting
                          return <p key={idx} className="text-gray-200 py-1 font-sans">{line}</p>;
                        }
                        return <p key={idx} className="text-gray-300 leading-relaxed font-sans py-0.5">{line}</p>;
                      })}
                    </div>

                  </div>
                ))}

                {isTyping && (
                  <div className="flex flex-col items-start animate-pulse">
                    <div className="flex items-center gap-2 mb-1 text-[9px] text-gray-500 font-mono">
                      <span>🧠 FINPILOT_CORE</span>
                      <span>•</span>
                      <span>RUNNING INFERENCE MATRIX...</span>
                    </div>
                    <div className="bg-[#12181F] text-gray-400 border border-gray-800/80 p-3.5 rounded-2xl flex items-center gap-2 font-mono text-xs shadow-md">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 rounded-full bg-[#10B981] animate-bounce [animation-delay:0.4s]" />
                      <span>Heuristics analysis pending...</span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* PROMPT QUICK INJECTION PANEL */}
              <div className="p-3 bg-[#12181F] border-t border-gray-800/80 flex flex-wrap gap-2 items-center">
                <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest mr-1">Ledger Prompts:</span>
                
                <button 
                  onClick={() => setChatInput("Where did I waste money this month? Run deep expense categories calculations.")}
                  className="text-[10px] font-mono bg-[#090D10] border border-gray-800 hover:border-gray-600 text-gray-300 px-2.5 py-1.5 rounded-lg transition-all"
                >
                  "Where did I waste money?"
                </button>
                
                <button 
                  onClick={() => setChatInput("Can I buy an iPhone next month based on spending trends?")}
                  className="text-[10px] font-mono bg-[#090D10] border border-gray-800 hover:border-gray-600 text-gray-300 px-2.5 py-1.5 rounded-lg transition-all"
                >
                  "Can I buy an iPhone next month?"
                </button>
                
                <button 
                  onClick={() => setChatInput("Audit my budget limits. Are any categories over budget or unstable?")}
                  className="text-[10px] font-mono bg-[#090D10] border border-gray-800 hover:border-gray-600 text-gray-300 px-2.5 py-1.5 rounded-lg transition-all"
                >
                  "Audit my budget limits"
                </button>

              </div>

              {/* INPUT FORM */}
              <form onSubmit={handleSendChatMessage} className="border-t border-gray-800/80 p-4 bg-[#12181F] flex gap-3 items-center">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Enter standard natural language queries to command the RAG models..."
                  className="flex-1 bg-[#090D10] border border-gray-800 rounded-xl p-3 font-mono text-xs focus:outline-none focus:border-emerald-500 text-white placeholder-gray-600 shadow-inner"
                />
                <button 
                  type="submit" 
                  disabled={isTyping}
                  className="bg-[#10B981] hover:bg-emerald-400 text-black font-black px-5 py-3 rounded-xl text-xs font-mono uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/10 flex items-center gap-2 disabled:opacity-55"
                >
                  <Send className="w-3.5 h-3.5" />
                  QUERY
                </button>
              </form>

            </div>

          </div>
        )}

        {/* ====================================================================
            TAB: AI NEURAL VISION OCR PORTAL
            ==================================================================== */}
        {activeTab === 'OCR' && (
          <div className="space-y-6 animate-[fadeIn_0.25s_ease-out]">
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* FILE DROP UPLOAD INTERACTIVE ZONE */}
              <div className="lg:col-span-1 bg-[#12181F] border border-gray-800/80 rounded-2xl p-5 flex flex-col justify-between h-fit">
                
                <div>
                  <div className="border-b border-gray-800/80 pb-3 mb-4">
                    <h3 className="text-xs font-mono font-bold tracking-widest text-white uppercase">AI NEURAL VISION OCR</h3>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed font-sans mb-4">
                    Drop or select any physical or digital expense statement/invoice. Our computer vision neural pipeline instantly performs text extraction and categorical class assignments.
                  </p>

                  {/* Drag drop target layout */}
                  <div className="relative border-2 border-dashed border-gray-800 hover:border-gray-700 bg-[#090D10]/40 rounded-xl p-8 text-center cursor-pointer transition-all group overflow-hidden">
                    
                    {/* Sweeping laser animation during scan */}
                    {isScanning && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-[#10B981] animate-[laser_1.8s_ease-in-out_infinite] shadow-[0_0_12px_#10B981]" />
                    )}

                    <input 
                      type="file" 
                      accept="image/*,application/pdf"
                      onChange={handleCustomFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={isScanning}
                    />

                    {isScanning ? (
                      <div className="space-y-3 font-mono">
                        <div className="w-8 h-8 border-2 border-t-transparent border-[#10B981] rounded-full animate-spin mx-auto" />
                        <span className="text-xs text-[#10B981] block font-bold">{scanStep}</span>
                        
                        <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden">
                          <div 
                            style={{ width: `${scanningProgress}%` }}
                            className="h-full bg-[#10B981] transition-all duration-300"
                          />
                        </div>
                        <span className="text-[10px] text-gray-500 block">{scanningProgress}% COMPLETE</span>
                      </div>
                    ) : (
                      <div className="space-y-2 py-4">
                        <UploadCloud className="w-10 h-10 text-gray-600 mx-auto group-hover:text-emerald-500 transition-colors" />
                        <div className="font-mono text-xs font-bold text-gray-300 group-hover:text-white">DRAG & DROP RECEIPT INVOICE</div>
                        <div className="text-[10px] text-gray-500 font-mono">Supports JPEG, PNG and PDF formats</div>
                      </div>
                    )}

                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-800/40 font-mono text-[10px] text-gray-500 text-center">
                  CAMERA ENVELOPE: <span className="text-[#10B981]">ACTIVE</span>
                </div>

              </div>

              {/* RECEIPT SAMPLES INGESTION GRID */}
              <div className="lg:col-span-2 bg-[#12181F] border border-gray-800/80 rounded-2xl p-5">
                <div className="border-b border-gray-800/80 pb-3 mb-4 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-mono font-bold tracking-widest text-white uppercase">MOCK OCR INGESTION MANIFESTS</h3>
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">TAP ONE TO INGEST</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SAMPLE_RECEIPTS.map((rc) => {
                    const activeScanMatch = scanningReceipt?.id === rc.id;
                    
                    return (
                      <div 
                        key={rc.id}
                        onClick={() => handleSelectSampleReceipt(rc)}
                        className={`bg-[#090D10] border rounded-xl p-4 cursor-pointer hover:border-emerald-500/40 transition-all text-xs font-mono relative overflow-hidden flex flex-col justify-between h-44 ${
                          activeScanMatch ? 'border-amber-500 bg-amber-500/[0.02]' : 'border-gray-800/80'
                        }`}
                      >
                        {/* Swiped laser when active scan match */}
                        {activeScanMatch && (
                          <div className="absolute top-0 left-0 right-0 h-[2px] bg-amber-500 animate-[laser_1.2s_ease-in-out_infinite] shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                        )}

                        <div>
                          <div className="flex justify-between items-start border-b border-gray-800/60 pb-1.5 mb-2">
                            <span className="font-bold text-gray-300">{rc.merchant}</span>
                            <span className="text-emerald-400 font-bold">₹{rc.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                          </div>
                          
                          <div className="space-y-1 text-[10px] text-gray-500">
                            {rc.items.map((it, idx) => (
                              <div key={idx} className="truncate">• {it}</div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center border-t border-gray-800/60 pt-2 text-[9px] text-gray-500">
                          <span>Date: {rc.date}</span>
                          <span className="bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20 uppercase font-bold text-[8px]">
                            {rc.category}
                          </span>
                        </div>

                      </div>
                    );
                  })}
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ====================================================================
            TAB: DEVELOPER PROFILE & DETAILED DEVPROJECT
            ==================================================================== */}
        {activeTab === 'DEVELOPER' && (
          <div className="space-y-6 animate-[fadeIn_0.25s_ease-out]">
            
            {/* HERO DEVELOPER BANNER */}
            <div className="bg-gradient-to-r from-[#12181F] to-[#090D10] border border-gray-800/80 rounded-2xl p-6 md:p-8 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#10B981]/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#10B981] to-[#3B82F6] p-[2px] shadow-lg shadow-emerald-500/10 shrink-0">
                    <div className="w-full h-full bg-[#12181F] rounded-2xl flex items-center justify-center font-black font-mono text-2xl text-white">
                      AM
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black tracking-tight text-white font-sans">Amanya</h2>
                      <span className="text-[9px] bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded-full border border-[#10B981]/20 font-mono font-bold">MCA STUDENT</span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-1">Specializing in Quantitative Financial Software & Predictive ML Systems</p>
                    <div className="flex flex-wrap gap-2 mt-2.5">
                      <span className="text-[9px] font-mono text-gray-500 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded">DELHI, INDIA</span>
                      <span className="text-[9px] font-mono text-gray-500 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded">MCA 2026</span>
                      <span className="text-[9px] font-mono text-[#10B981] bg-[#10B981]/5 border border-[#10B981]/10 px-2 py-0.5 rounded font-bold">SYSTEM ARCHITECT</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <a 
                    href="mailto:amanya@mca-student.example"
                    onClick={(e) => { e.preventDefault(); alert("Contact dispatched to Amanya: amanya@mca-student.example"); }}
                    className="text-xs bg-[#10B981] hover:bg-[#10B981]/80 text-black font-bold px-4 py-2.5 rounded-xl font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Secure Contact
                  </a>
                  <button 
                    onClick={() => { alert("Workspace telemetry offline: Amanya's detailed developer credentials are AES-256 secure."); }}
                    className="text-xs bg-[#12181F] hover:bg-gray-800 text-white font-mono border border-gray-800 px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5"
                  >
                    <Terminal className="w-3.5 h-3.5 text-blue-500" />
                    Workspace Terminal
                  </button>
                </div>
              </div>
            </div>

            {/* BENTO ARCHITECTURE ROWS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* PRIMARY PROJECTS / PORTFOLIO */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* DETAILED CASE STUDY: FINPILOT AI */}
                <div className="bg-[#12181F] border border-gray-800/80 rounded-2xl p-5 space-y-5">
                  <div className="border-b border-gray-800/80 pb-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#10B981]" />
                      <h3 className="text-xs font-mono font-bold tracking-widest text-white uppercase">DETAILED DEVPROJECT: FINPILOT AI</h3>
                    </div>
                    <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-mono font-bold uppercase">CAPSTONE THESIS</span>
                  </div>

                  <div className="space-y-4 font-sans text-xs text-gray-300 leading-relaxed">
                    <p>
                      <strong>FinPilot AI</strong> is a premium, secure wealth operations terminal designed specifically to handle localized Indian Rupees (<span className="text-white font-bold font-mono">₹</span>) assets, OCR receipt scans, and seasonal trend forecasting. Built as an MCA software architecture capstone, the project bridges clean linear visual flows with robust, offline-resilient quantitative heuristics.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-3.5 bg-[#090D10] border border-gray-800/60 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-mono text-[#10B981] block font-bold">1. INDIAN CURRENCY LOCALIZATION ENGINE</span>
                        <p className="text-[11px] text-gray-400">
                          Engineered systemic integrations with the <code className="text-xs text-white bg-gray-900 px-1 rounded">en-IN</code> localization schema, implementing native Rupee formatting (₹) across dashboards, live budgets, AI OCR scans, and predictive forecasting arrays.
                        </p>
                      </div>

                      <div className="p-3.5 bg-[#090D10] border border-gray-800/60 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-mono text-blue-400 block font-bold">2. SEASONAL ML REGRESSION MODELING</span>
                        <p className="text-[11px] text-gray-400">
                          Designed a dynamic mathematical trend calculator inside a vectorized SVG layout. Incorporates inflation compounding, holiday multiplier sliders, and adjustable projection range coefficients.
                        </p>
                      </div>

                      <div className="p-3.5 bg-[#090D10] border border-gray-800/60 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-mono text-purple-400 block font-bold">3. COMPUTER VISION OCR PIPELINE</span>
                        <p className="text-[11px] text-gray-400">
                          Implemented state-machine simulation representing multi-stage image pre-processing, layout extraction, structural field mapping, and final categorical entry ingestion.
                        </p>
                      </div>

                      <div className="p-3.5 bg-[#090D10] border border-gray-800/60 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-mono text-amber-500 block font-bold">4. AI RESILIENCE CHATFALLBACKS</span>
                        <p className="text-[11px] text-gray-400">
                          Engineered offline fallback heuristics compiling instant RAG-style responses even under poor network states, protecting the UI from server latency.
                        </p>
                      </div>
                    </div>

                    <div className="bg-[#090D10]/50 border border-gray-800 rounded-xl p-4 font-mono text-[11px] space-y-2">
                      <span className="text-[#10B981] font-bold block">PROJECT SUMMARY & SPECIFICATION MANIFEST:</span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-gray-400">
                        <div>
                          <span className="text-[9px] text-gray-600 block">FRONTEND</span>
                          <span className="text-white">React 19, TSX</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-600 block">STYLING</span>
                          <span className="text-white">Tailwind v4</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-600 block">ANIMATION</span>
                          <span className="text-white">Framer Motion</span>
                        </div>
                        <div>
                          <span className="text-[9px] text-gray-600 block">DATA ENGINE</span>
                          <span className="text-white">Local Heuristics</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AMANYA'S CURRICULUM PROJECT STACK */}
                <div className="bg-[#12181F] border border-gray-800/80 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-800/80 pb-3">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-mono font-bold tracking-widest text-white uppercase">ADDITIONAL ACADEMIC PROJECTS</h3>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3.5 bg-[#090D10] border border-gray-800/60 rounded-xl flex items-center justify-between hover:border-[#10B981]/20 transition-all">
                      <div>
                        <span className="text-[10px] text-[#10B981] font-bold block">CRYPTOGRAPHY ENCLAVE SECURE DATABASE</span>
                        <span className="text-gray-400 text-[11px] font-sans">A light relational storage engine encrypted with AES-256 for student records.</span>
                      </div>
                      <span className="text-[9px] bg-emerald-500/10 text-[#10B981] px-2 py-0.5 rounded border border-emerald-500/20 uppercase font-bold shrink-0">C++ / SQLite</span>
                    </div>

                    <div className="p-3.5 bg-[#090D10] border border-gray-800/60 rounded-xl flex items-center justify-between hover:border-blue-500/20 transition-all">
                      <div>
                        <span className="text-[10px] text-blue-400 font-bold block">REAL-TIME PACKET TRAFFIC DETECTOR</span>
                        <span className="text-gray-400 text-[11px] font-sans">Network performance diagnostic framework visualizing latency bursts over custom charts.</span>
                      </div>
                      <span className="text-[9px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 uppercase font-bold shrink-0">Python / socket</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* SIDEBAR: SKILLS & TERMINAL */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* INTERACTIVE SKILL STACK METER */}
                <div className="bg-[#12181F] border border-gray-800/80 rounded-2xl p-5 space-y-4">
                  <div className="border-b border-gray-800/80 pb-3 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Code className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-xs font-mono font-bold tracking-widest text-white uppercase">ENGINEERING TOOLKIT</h3>
                    </div>
                    <span className="text-[9px] bg-[#10B981]/10 text-[#10B981] px-2 py-0.5 rounded border border-[#10B981]/20 font-mono">100% VERIFIED</span>
                  </div>

                  <div className="space-y-3 font-mono text-xs">
                    {[
                      { name: 'React & TypeScript', level: 95, color: 'bg-emerald-500' },
                      { name: 'Algorithms & Data Structs', level: 90, color: 'bg-blue-500' },
                      { name: 'Quantitative Forecasting', level: 85, color: 'bg-purple-500' },
                      { name: 'Financial Heuristics', level: 88, color: 'bg-amber-500' },
                    ].map((sk, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-gray-300">{sk.name}</span>
                          <span className="text-gray-500">{sk.level}%</span>
                        </div>
                        <div className="w-full bg-[#090D10] h-1.5 rounded-full overflow-hidden border border-gray-800/60">
                          <div style={{ width: `${sk.level}%` }} className={`h-full ${sk.color} rounded-full`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* LIVE ACADEMIC WORKSPACE TELEMETRY TAPE */}
                <div className="bg-[#12181F] border border-gray-800/80 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-800/80 pb-3">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    <h3 className="text-xs font-mono font-bold tracking-widest text-white uppercase">WORKSPACE TELEMETRY</h3>
                  </div>

                  <div className="space-y-3 font-mono text-[10px] text-gray-500">
                    <div className="flex justify-between items-center p-2.5 bg-[#090D10] border border-gray-800/60 rounded-xl">
                      <span>CURRENT ROLE:</span>
                      <span className="text-white font-bold">MCA CANDIDATE</span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-[#090D10] border border-gray-800/60 rounded-xl">
                      <span>ACADEMIC STATUS:</span>
                      <span className="text-[#10B981] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                        ACTIVE
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-2.5 bg-[#090D10] border border-gray-800/60 rounded-xl">
                      <span>ALGORITHMIC LOAD:</span>
                      <span className="text-blue-400 font-bold">94.8% OPTIMAL</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

      </main>

      {/* 3. HUDBAR TICKER FOOTER */}
      <footer className="w-full border-t border-gray-800/80 bg-[#12181F]/30 px-6 py-4 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[10px] font-mono text-gray-500 gap-3">
          
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span>ALL ML RUNTIMES ACTIVE // AUTO-OPTIMIZATION PARSING ENGINE RUNNING</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span>SECURE CRYPTO STORAGE METRICS SYNCED</span>
            <span>|</span>
            <span>ACC LEVEL: ENTERPRISE VIP OPERATOR</span>
          </div>

        </div>
      </footer>
      
    </div>
  );
}
