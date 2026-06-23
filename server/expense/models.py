import uuid
from django.db import models
from person.models import Employee

class Expense(models.Model):
    # --- 1. CATEGORY SETUP ---
    MAIN_CATEGORIES = [
        ('Salary', 'Employee Salary'),
        ('Operational', 'Operational Expenses'),
        ('Loan', 'Loan Payments'),
        ('Asset', 'Asset Purchase'),
        ('Others', 'Others'),
    ]

    SUB_CATEGORIES = [
        # Employee Salary Breakdowns
        ('Basic Pay', 'Basic Pay'),
        ('Overtime', 'Overtime'),
        ('Bonus', 'Bonus / Festival Allowance'),
        ('Advance Salary', 'Advance Salary / Loan Adjustment'),
        
        # Operational Expenses
        ('Rent', 'Shop / Warehouse Rent'),
        ('Utility', 'Electricity / Water / Internet'),
        ('Office Supplies', 'Office Supplies & Stationery'),
        ('Entertainment', 'Tea / Snacks / Client Entertainment'),
        ('Transportation', 'Transportation / Conveyance'),
        ('Maintenance', 'Repairs & Maintenance'),
        ('Marketing', 'Marketing & Promotions'),
        
        # Loan Payments
        ('Bank EMI', 'Bank Loan EMI'),
        ('Private Loan', 'Private Loan Repayment'),
        
        # Asset Purchases
        ('Furniture', 'Furniture & Fixtures'),
        ('IT Equipment', 'Computers & IT Equipment'),
        ('Tools', 'Tools & Machinery'),
        
        # Others
        ('Miscellaneous', 'Miscellaneous'),
        ('Donation', 'Donation / Charity'),
        ('Fines', 'Fines / Penalties'),
    ]

    PAYMENT_METHODS = [
        ('Cash', 'Cash'),
        ('Bank Transfer', 'Bank Transfer'),
        ('bKash', 'bKash'),
        ('Nagad', 'Nagad'),
        ('Rocket', 'Rocket'),
        ('Cheque', 'Cheque'),
    ]

    # --- 2. CORE FIELDS ---
    expense_id = models.CharField(max_length=20, unique=True, editable=False)
    main_category = models.CharField(max_length=50, choices=MAIN_CATEGORIES)
    sub_category = models.CharField(max_length=50, choices=SUB_CATEGORIES)
    
    # --- 3. SALARY SPECIFIC FIELDS ---
    # If the expense is a salary, which employee is receiving it?
    employee_recipient = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='received_salaries', help_text="Select if Main Category is Salary")
    salary_month = models.DateField(null=True, blank=True, help_text="If this is a salary, what month is it for?")

    # --- 4. FINANCIAL DETAILS ---
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PAYMENT_METHODS, default='Cash')
    transaction_id = models.CharField(max_length=100, null=True, blank=True, help_text="Bank/Mobile Banking TXN ID. Leave empty if Cash.")
    
    # --- 5. TRACKING ---
    expense_date = models.DateField(auto_now_add=True)
    remarks = models.TextField(blank=True, null=True)
    entry_by = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='expense_entries')

    def save(self, *args, **kwargs):
        if not self.expense_id:
            self.expense_id = f"EXP-{uuid.uuid4().hex[:6].upper()}"
        super(Expense, self).save(*args, **kwargs)

    def __str__(self):
        return f"{self.expense_id} | {self.main_category} ({self.sub_category}) | ৳{self.amount}"