import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, transactions, budgets } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
        const reply = generateSmartFallbackReply(message, transactions, budgets);
        return res.json({
          text: reply,
          isFallback: true
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const formattedTxs = transactions ? JSON.stringify(transactions, null, 2) : "No transactions log.";
      const formattedBudgets = budgets ? JSON.stringify(budgets, null, 2) : "No budgets set.";

      const prompt = `
User Query: "${message}"

Below is the user's current transaction ledger and budget matrices. Use this exact, real-time data to answer their question with high financial precision, calculations, and recommendations.

### CURRENT TRANSACTION LEDGER:
${formattedTxs}

### BUDGET ENFORCEMENT MATRIX (Allocated vs Spent):
${formattedBudgets}

Guidelines:
1. Provide a direct, highly-analytical answer.
2. Be brief but highly quantitative. Reference specific merchants, amounts, and category budget percentages where relevant.
3. Suggest clear, actionable steps.
4. Keep the tone sharp, elite, professional, and supportive (like a premium private banking terminal).
5. Output your response as clean Markdown. Do NOT use headers like h1 or h2 unless necessary; prefer bold bullet points and clean structure.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are FinPilot AI, an elite FinTech Personal Expense Coach and Wealth Advisor. You analyze ledger logs and budget thresholds. Your tone is prestigious, direct, quantitative, and elite. Keep your responses concise (under 250 words) and high-impact."
        }
      });

      res.json({
        text: response.text || "I was unable to analyze your ledger logs. Please retry.",
        isFallback: false
      });

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: "Analysis engine failed. Please try again.", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Fallback rule-based analyzer when Gemini API Key is not configured
function generateSmartFallbackReply(message: string, transactions: any[], budgets: any[]): string {
  const query = message.toLowerCase();
  
  const txList = transactions || [];
  const bgList = budgets || [];
  
  const totalIncome = txList.filter((t: any) => t.type === 'INCOME').reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const totalExpenses = txList.filter((t: any) => t.type === 'EXPENSE').reduce((acc: number, curr: any) => acc + curr.amount, 0);
  const currentNetSavings = totalIncome - totalExpenses;

  let responseText = "### 🧠 **FINPILOT STANDALONE ENGINE ANALYTICAL UPDATE**\n\n*Note: Connecting your standard API key in **Settings > Secrets** will unlock fully-fluent contextual NLP reasoning models.*\n\n";

  if (query.includes('waste') || query.includes('spend') || query.includes('wasting') || query.includes('expense')) {
    const expenses = txList.filter((t: any) => t.type === 'EXPENSE');
    if (expenses.length === 0) {
      responseText += "No debit entries detected. System metrics are nominal with zero active expenditure vectors.";
    } else {
      const topExpense = [...expenses].sort((a: any, b: any) => b.amount - a.amount)[0];
      const categories: {[key: string]: number} = {};
      expenses.forEach((t: any) => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });
      const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];

      responseText += `**EXPENSE ANALYSIS:**\n` +
        `- **Dominant Category Vector:** **${topCategory[0]}** with total allocations of **₹${topCategory[1].toLocaleString('en-IN', {minimumFractionDigits: 2})}**.\n` +
        `- **Single Highest Outlier:** **${topExpense.merchant}** on ${topExpense.date} for **₹${topExpense.amount.toLocaleString('en-IN', {minimumFractionDigits: 2})}** (${topExpense.category}).\n\n` +
        `**Recommendation:** Compress non-essential vectors under *${topCategory[0]}* by 15% immediately to reclaim approximately **₹${(topCategory[1] * 0.15).toLocaleString('en-IN', {minimumFractionDigits: 2})}** in active cash reserves.`;
    }
  } else if (query.includes('iphone') || query.includes('buy') || query.includes('purchase')) {
    if (currentNetSavings > 50000) {
      responseText += `**PURCHASE PATH VIABILITY:**\n` +
        `- **Current Monthly Surplus:** **₹${currentNetSavings.toLocaleString('en-IN', {minimumFractionDigits: 2})}**.\n` +
        `- **Verdict:** **APPROVED**. Allocating ₹1,20,000 for a premium asset maintains safe capital ratios and won't trigger deficit thresholds.\n\n` +
        `*Advisory: Fund this through capital accounts to protect standard monthly operating cash flows.*`;
    } else {
      responseText += `**PURCHASE PATH VIABILITY:**\n` +
        `- **Current Monthly Surplus:** **₹${currentNetSavings.toLocaleString('en-IN', {minimumFractionDigits: 2})}**.\n` +
        `- **Verdict:** **DEFERRED / HIGH RISK**.\n\n` +
        `With a net savings of only **₹${currentNetSavings.toLocaleString('en-IN', {minimumFractionDigits: 2})}**, acquiring a premium asset of ₹1,20,000+ increases structural risk of crossing into active deficits. I recommend establishing a designated sinking fund of **₹15,000/month** for 8 months.`;
    }
  } else if (query.includes('budget') || query.includes('limit') || query.includes('framework')) {
    const overBudget = bgList.find((b: any) => b.spent > b.allocated);
    if (overBudget) {
      const excess = overBudget.spent - overBudget.allocated;
      responseText += `**BUDGET ENFORCEMENT AUDIT:**\n` +
        `- **Breached Vector Detected:** **${overBudget.category}** has exceeded allocations by **₹${excess.toLocaleString('en-IN', {minimumFractionDigits: 2})}** (${((overBudget.spent/overBudget.allocated)*100).toFixed(0)}% used).\n` +
        `- **Action:** Reallocate ₹${excess.toLocaleString('en-IN', {minimumFractionDigits: 2})} from non-breached columns or enforce instant spending freeze on this vector.\n\n` +
        `*Optimizing cash flow by suppressing non-essential outlays will restore balance health.*`;
    } else {
      responseText += `**BUDGET ENFORCEMENT AUDIT:**\n` +
        `- **Status:** **ALL SYSTEMS OPTIMAL**.\n` +
        `- **Summary:** All monitored sectors remain 100% compliant beneath allocated limits.\n\n` +
        `*Keep maintaining the current spending velocity to stay on target with your savings trajectory.*`;
    }
  } else {
    responseText += `**GENERAL LEDGER TRAJECTORY AUDIT:**\n` +
      `- **Total Ingested Volume (Income):** **₹${totalIncome.toLocaleString('en-IN', {minimumFractionDigits: 2})}**\n` +
      `- **Deviated Disbursements (Expenses):** **₹${totalExpenses.toLocaleString('en-IN', {minimumFractionDigits: 2})}**\n` +
      `- **Current Net Reserves:** **₹${currentNetSavings.toLocaleString('en-IN', {minimumFractionDigits: 2})}**\n\n` +
      `System indicators are highly stable. Enter more standard queries (e.g., regarding 'spending', 'budgets', or 'purchases') to trigger specific vector projection calculations.`;
  }

  return responseText;
}

startServer();
