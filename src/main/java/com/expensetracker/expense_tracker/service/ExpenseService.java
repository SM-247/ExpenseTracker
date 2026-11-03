
package com.expensetracker.expense_tracker.service;

import com.expensetracker.expense_tracker.model.Expense;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class ExpenseService {

    private final List<Expense> expenses = new ArrayList<>();

    private final AtomicLong idCounter = new AtomicLong(1);

    // Get all expenses
    public List<Expense> getAllExpenses() {
        return new ArrayList<>(expenses);
    }

    // Add a new expense
    public Expense addExpense(Expense expense) {
        expense.setId(idCounter.getAndIncrement());
        expenses.add(expense);
        return expense;
    }

    // Get expense by ID
    public Expense getExpenseById(Long id) {
        return expenses.stream()
                .filter(e -> e.getId().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Expense not found"));
    }

    // Delete an expense
    public void deleteExpense(Long id) {
        Expense expense = getExpenseById(id);
        expenses.remove(expense);
    }
}
