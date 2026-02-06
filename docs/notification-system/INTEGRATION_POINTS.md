# 🔔 Notification Integration Guide

## 📍 Where Notifications Are Triggered

This guide shows you **exactly where** to integrate notifications in your Finance Tracker app.

---

## 🎯 **Integration Points**

### **1. Transaction Created** 💰

**File:** `lib/actions/transaction.actions.ts`

**When:** User creates a new transaction (income/expense)

**Integration:**

```typescript
// In createTransaction function, after transaction is saved
import { createNotification } from "@/lib/actions/notification.actions";

export const createTransaction = async (transaction: TransactionData) => {
  // ... existing transaction creation code ...
  
  const newTransaction = await Transaction.create(transaction);
  
  // 🔔 SEND NOTIFICATION
  await createNotification(transaction.user, {
    title: transaction.isIncome ? "💰 Income Recorded" : "💸 Expense Recorded",
    message: `${transaction.isIncome ? "Income" : "Expense"} of ₹${transaction.amount} for ${transaction.category}`,
    type: "transaction",
    data: {
      transactionId: newTransaction._id.toString(),
      amount: transaction.amount.toString(),
      type: transaction.type,
    },
    actionUrl: "/transactions",
    sendPush: true, // Enable push notifications
  });
  
  return newTransaction;
};
```

---

### **2. EMI Payment Due** 📅

**File:** `lib/actions/emi.actions.ts` or cron job

**When:** EMI payment is due in 3 days

**Integration:**

```typescript
// In EMI reminder cron job or check function
import { createNotification } from "@/lib/actions/notification.actions";

export const checkUpcomingEMIs = async () => {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
  
  // Find EMIs due in 3 days
  const upcomingEMIs = await EMI.find({
    nextPaymentDate: {
      $gte: new Date(),
      $lte: threeDaysFromNow,
    },
    status: "active",
  }).populate("user");
  
  // Send notification for each
  for (const emi of upcomingEMIs) {
    await createNotification(emi.user._id.toString(), {
      title: "⏰ EMI Payment Reminder",
      message: `EMI of ₹${emi.emiAmount} for ${emi.loanType} is due on ${emi.nextPaymentDate.toLocaleDateString()}`,
      type: "reminder",
      category: "emi",
      data: {
        emiId: emi._id.toString(),
        amount: emi.emiAmount.toString(),
        dueDate: emi.nextPaymentDate.toISOString(),
      },
      actionUrl: `/emis/${emi._id}`,
      sendPush: true,
      priority: "high",
    });
  }
};
```

---

### **3. Budget Warning** ⚠️

**File:** `lib/actions/transaction.actions.ts`

**When:** User exceeds budget threshold

**Integration:**

```typescript
// After creating expense transaction
export const createTransaction = async (transaction: TransactionData) => {
  // ... create transaction ...
  
  if (!transaction.isIncome) {
    // Check budget
    const spent = await getMonthlySpending(transaction.user, transaction.category);
    const budget = await getBudgetForCategory(transaction.user, transaction.category);
    
    if (budget) {
      const percentage = (spent / budget.limit) * 100;
      
      // 🔔 BUDGET WARNING
      if (percentage >= 80 && percentage < 100) {
        await createNotification(transaction.user, {
          title: "⚠️ Budget Warning",
          message: `You've used ${percentage.toFixed(0)}% of your ${transaction.category} budget`,
          type: "alert",
          category: "budget",
          data: {
            category: transaction.category,
            spent: spent.toString(),
            limit: budget.limit.toString(),
            percentage: percentage.toString(),
          },
          actionUrl: "/analytics",
          sendPush: true,
        });
      }
      
      // 🔔 BUDGET EXCEEDED
      if (percentage >= 100) {
        await createNotification(transaction.user, {
          title: "🚨 Budget Exceeded!",
          message: `You've exceeded your ${transaction.category} budget by ₹${spent - budget.limit}`,
          type: "alert",
          category: "budget",
          data: {
            category: transaction.category,
            exceeded: (spent - budget.limit).toString(),
          },
          actionUrl: "/analytics",
          sendPush: true,
          priority: "high",
        });
      }
    }
  }
  
  return newTransaction;
};
```

---

### **4. EMI Payment Processed** ✅

**File:** `lib/actions/emi.actions.ts`

**When:** EMI payment is successfully recorded

**Integration:**

```typescript
// In the EMI payment processing function
export const processEMIPayment = async (emiId: string) => {
  const emi = await EMI.findById(emiId).populate("user");
  
  // ... process payment ...
  
  // 🔔 PAYMENT SUCCESS
  await createNotification(emi.user._id.toString(), {
    title: "✅ EMI Payment Recorded",
    message: `Payment of ₹${emi.emiAmount} for ${emi.loanType} has been processed`,
    type: "success",
    category: "emi",
    data: {
      emiId: emi._id.toString(),
      amount: emi.emiAmount.toString(),
    },
    actionUrl: `/emis/${emi._id}`,
    sendPush: true,
  });
};
```

---

### **5. Low Balance Alert** 💳

**File:** `lib/actions/bank-account.actions.ts`

**When:** Bank account balance goes below threshold

**Integration:**

```typescript
// After updating bank account balance
export const updateBankBalance = async (accountId: string, amount: number) => {
  const account = await BankAccount.findById(accountId).populate("user");
  
  // Update balance
  account.balance += amount;
  await account.save();
  
  // 🔔 LOW BALANCE WARNING
  const threshold = 1000; // ₹1000 threshold
  if (account.balance < threshold && account.balance > 0) {
    await createNotification(account.user._id.toString(), {
      title: "⚠️ Low Balance Alert",
      message: `Your ${account.bank.name} account balance is low: ₹${account.balance}`,
      type: "alert",
      category: "account",
      data: {
        accountId: account._id.toString(),
        balance: account.balance.toString(),
      },
      actionUrl: "/dashboard",
      sendPush: true,
    });
  }
};
```

---

### **6. Monthly Summary** 📊

**File:** Cron job or scheduled task

**When:** End of each month

**Integration:**

```typescript
// Monthly summary cron (run on 1st of each month)
export const sendMonthlySummary = async () => {
  const users = await User.find({ isActive: true });
  
  for (const user of users) {
    const lastMonth = getLastMonth();
    const income = await getTotalIncome(user._id, lastMonth);
    const expenses = await getTotalExpenses(user._id, lastMonth);
    const savings = income - expenses;
    
    // 🔔 MONTHLY SUMMARY
    await createNotification(user.clerkId, {
      title: "📊 Monthly Financial Summary",
      message: `Last month: Income ₹${income}, Expenses ₹${expenses}, Savings ₹${savings}`,
      type: "info",
      category: "report",
      data: {
        income: income.toString(),
        expenses: expenses.toString(),
        savings: savings.toString(),
        month: lastMonth.toISOString(),
      },
      actionUrl: "/analytics",
      sendPush: true,
    });
  }
};
```

---

### **7. Large Transaction Alert** 🚨

**File:** `lib/actions/transaction.actions.ts`

**When:** User creates transaction above certain amount

**Integration:**

```typescript
export const createTransaction = async (transaction: TransactionData) => {
  const newTransaction = await Transaction.create(transaction);
  
  // 🔔 LARGE TRANSACTION ALERT
  const largeAmountThreshold = 10000; // ₹10,000
  if (transaction.amount >= largeAmountThreshold) {
    await createNotification(transaction.user, {
      title: transaction.isIncome ? "💰 Large Income Received" : "🚨 Large Expense Alert",
      message: `${transaction.isIncome ? "Income" : "Expense"} of ₹${transaction.amount.toLocaleString()} recorded`,
      type: transaction.isIncome ? "success" : "alert",
      category: "transaction",
      data: {
        transactionId: newTransaction._id.toString(),
        amount: transaction.amount.toString(),
      },
      actionUrl: "/transactions",
      sendPush: true,
      priority: "high",
    });
  }
  
  return newTransaction;
};
```

---

### **8. Recurring Transaction Reminder** 🔄

**File:** Cron job

**When:** Recurring transaction is due

**Integration:**

```typescript
// Check for recurring transactions (run daily)
export const checkRecurringTransactions = async () => {
  const today = new Date();
  const recurringDue = await RecurringTransaction.find({
    nextDueDate: {
      $lte: today,
    },
    isActive: true,
  }).populate("user");
  
  for (const recurring of recurringDue) {
    // 🔔 RECURRING REMINDER
    await createNotification(recurring.user._id.toString(), {
      title: "🔄 Recurring Transaction Reminder",
      message: `Don't forget: ${recurring.description} - ₹${recurring.amount}`,
      type: "reminder",
      category: "transaction",
      data: {
        recurringId: recurring._id.toString(),
        amount: recurring.amount.toString(),
      },
      actionUrl: "/transactions",
      sendPush: true,
    });
  }
};
```

---

## 🗂️ **File Locations for Integration**

### **Transaction Notifications**
```
File: lib/actions/transaction.actions.ts
Functions to modify:
  - createTransaction()
  - updateTransaction()
  - deleteTransaction()
```

### **EMI Notifications**
```
File: lib/actions/emi.actions.ts
Functions to modify:
  - createEMI()
  - processEMIPayment()
  
File: app/api/cron/process-emis/route.ts
  - Add notification before payment due
```

### **Budget Notifications**
```
File: lib/actions/transaction.actions.ts
Function: createTransaction()
  - Check budget after expense
  - Send warning at 80%, 100%
```

### **Account Notifications**
```
File: lib/actions/bank-account.actions.ts
Functions:
  - updateAccountBalance()
  - checkLowBalance()
```

---

## 📋 **Integration Checklist**

For each feature, add notification by:

1. **Import the function:**
   ```typescript
   import { createNotification } from "@/lib/actions/notification.actions";
   ```

2. **Call after the event:**
   ```typescript
   await createNotification(userId, {
     title: "...",
     message: "...",
     type: "...",
     sendPush: true,
   });
   ```

3. **Test it works:**
   - Trigger the event
   - Check bell icon for notification
   - Verify push notification appears

---

## 🎯 **Quick Integration Example**

Let's integrate transaction notifications right now!

**File: `lib/actions/transaction.actions.ts`**

Find the `createTransaction` function and add:

```typescript
import { createNotification } from "@/lib/actions/notification.actions";

// At the end of createTransaction, before return:
await createNotification(clerkId, {
  title: `${isIncome ? "💰" : "💸"} ${isIncome ? "Income" : "Expense"} Recorded`,
  message: `₹${amount} - ${category}${description ? ": " + description : ""}`,
  type: "transaction",
  data: {
    transactionId: newTransaction._id.toString(),
    amount: amount.toString(),
  },
  actionUrl: "/transactions",
  sendPush: true,
});
```

That's it! Now every transaction creates a notification automatically.

---

## 🔄 **Cron Jobs for Scheduled Notifications**

For time-based notifications (EMI reminders, monthly summaries), you need cron jobs.

**Create:** `app/api/cron/notification-reminders/route.ts`

```typescript
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/actions/notification.actions";
import EMI from "@/lib/database/models/emi.model";

export async function GET() {
  try {
    // Check for EMIs due in 3 days
    const threeDays = new Date();
    threeDays.setDate(threeDays.getDate() + 3);
    
    const upcomingEMIs = await EMI.find({
      nextPaymentDate: { $lte: threeDays, $gte: new Date() },
      status: "active",
    }).populate("user");
    
    for (const emi of upcomingEMIs) {
      await createNotification(emi.user.clerkId, {
        title: "⏰ EMI Payment Due Soon",
        message: `₹${emi.emiAmount} payment due in 3 days`,
        type: "reminder",
        actionUrl: `/emis/${emi._id}`,
        sendPush: true,
      });
    }
    
    return NextResponse.json({
      success: true,
      count: upcomingEMIs.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**Then in Vercel:** Set up cron job to run this daily.

---

## ✅ **Summary: Where to Add Notifications**

| Event | File | Function | Priority |
|-------|------|----------|----------|
| Transaction created | `transaction.actions.ts` | `createTransaction()` | High |
| EMI due soon | `app/api/cron/...` | Cron job | High |
| Budget warning | `transaction.actions.ts` | `createTransaction()` | Medium |
| EMI payment processed | `emi.actions.ts` | `processEMIPayment()` | Medium |
| Low balance | `bank-account.actions.ts` | `updateBankBalance()` | Medium |
| Monthly summary | `app/api/cron/...` | Cron job | Low |

---

## 🚀 **Next Steps**

1. **Start with transactions** - Add to `createTransaction()`
2. **Test it** - Create a transaction, verify notification appears
3. **Add EMI reminders** - Create cron job
4. **Add budget warnings** - Integrate into transaction creation
5. **Expand** - Add more notification types as needed

---

**The notification system is ready - just need to integrate into your features!** 🎉

