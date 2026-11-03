
package com.expensetracker.expense_tracker.service;

import com.expensetracker.expense_tracker.model.Expense;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ExpenseServiceTest {

    private ExpenseService expenseService;

    @BeforeEach
    void setUp() {
        expenseService = new ExpenseService();
    }

    // Test 1: Adding an expense
    @Test
    void shouldAddExpense() {

        Expense expense = new Expense(
                null,
                "Lunch",
                250.0,
                "Food",
                LocalDate.now()
        );

        Expense savedExpense = expenseService.addExpense(expense);

        assertNotNull(savedExpense.getId());
        assertEquals(1L, savedExpense.getId());
        assertEquals("Lunch", savedExpense.getTitle());
    }

    // Test 2: Retrieving all expenses
    @Test
    void shouldRetrieveAllExpenses() {

        Expense expense1 = new Expense(
                null, "Lunch", 250.0, "Food", LocalDate.now()
        );

        Expense expense2 = new Expense(
                null, "Bus", 50.0, "Transport", LocalDate.now()
        );

        expenseService.addExpense(expense1);
        expenseService.addExpense(expense2);

        List<Expense> expenses = expenseService.getAllExpenses();

        assertEquals(2, expenses.size());
        assertEquals("Lunch", expenses.get(0).getTitle());
        assertEquals("Bus", expenses.get(1).getTitle());
    }

    // Test 3: Retrieving an expense by ID
    @Test
    void shouldRetrieveExpenseById() {

        Expense expense = new Expense(
                null,
                "Travel",
                150.0,
                "Transport",
                LocalDate.now()
        );

        Expense savedExpense = expenseService.addExpense(expense);

        Expense retrievedExpense =
                expenseService.getExpenseById(savedExpense.getId());

        assertEquals(savedExpense.getId(), retrievedExpense.getId());
        assertEquals("Travel", retrievedExpense.getTitle());
        assertEquals(150.0, retrievedExpense.getAmount());
    }

    // Test 4: Handling a nonexistent expense
    @Test
    void shouldThrow404WhenExpenseDoesNotExist() {

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> expenseService.getExpenseById(999L)
        );

        assertEquals(404, exception.getStatusCode().value());
    }
}
