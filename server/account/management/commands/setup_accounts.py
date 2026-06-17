from django.core.management.base import BaseCommand
from account.models import Account

class Command(BaseCommand):
    help = 'Seeds the database with the Standard Bangladesh Chart of Accounts'

    def handle(self, *args, **kwargs):
        bd_standard_accounts = [
            {"code": "1000", "name": "Cash", "group": "Asset", "description": "Physical cash in hand"},
            {"code": "1010", "name": "Bank account", "group": "Asset", "description": "Current account balance"},
            {"code": "1020", "name": "Accounts receivable", "group": "Asset", "description": "Money owed by customers"},
            {"code": "1030", "name": "Inventory", "group": "Asset", "description": "Stock of goods/materials"},
            {"code": "1040", "name": "Prepaid expenses", "group": "Asset", "description": "Advance payments made"},
            
            {"code": "2000", "name": "Accounts payable", "group": "Liability", "description": "Amount owed to suppliers"},
            {"code": "2010", "name": "VAT payable", "group": "Liability", "description": "Collected VAT to be remitted"},
            {"code": "2020", "name": "Income tax payable", "group": "Liability", "description": "Tax due to NBR"},
            
            {"code": "3000", "name": "Owner's capital", "group": "Equity", "description": "Owner's investment"},
            {"code": "3010", "name": "Retained earnings", "group": "Equity", "description": "Accumulated profits"},
            
            {"code": "4000", "name": "Sales revenue", "group": "Revenue", "description": "Income from sales"},
            {"code": "4010", "name": "Other income", "group": "Revenue", "description": "Non-core income"},
            
            {"code": "5000", "name": "Cost of goods sold", "group": "Expense", "description": "Direct cost of sales"},
            {"code": "5010", "name": "Direct labor", "group": "Expense", "description": "Wages of production staff"},
            {"code": "6000", "name": "Rent expense", "group": "Expense", "description": "Office/factory rent"},
            {"code": "6010", "name": "Utilities expense", "group": "Expense", "description": "Electricity, water, gas"},
            {"code": "6020", "name": "Marketing expense", "group": "Expense", "description": "Advertising and promotion"},
            {"code": "6030", "name": "Administrative expense", "group": "Expense", "description": "Office admin cost"}
        ]

        created_count = 0

        self.stdout.write(self.style.WARNING("Starting to seed Chart of Accounts..."))

        for acc in bd_standard_accounts:
            # ✅ FIXED: Removed 'balance': 0.00 from defaults
            obj, created = Account.objects.get_or_create(
                code=acc['code'],
                defaults={
                    'name': acc['name'],
                    'group': acc['group'],
                    'description': acc['description']
                }
            )

            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"✅ Created: {acc['code']} - {acc['name']}"))
            else:
                self.stdout.write(self.style.NOTICE(f"⏩ Skipped: {acc['code']} - {acc['name']} (Already exists)"))

        self.stdout.write(self.style.SUCCESS(f"\n🎉 Success! Added {created_count} new accounts to the ledger."))