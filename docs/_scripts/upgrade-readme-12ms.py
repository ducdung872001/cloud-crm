"""Upgrade docs/backend-tasks/README.md from 11 → 12 microservice (add customer/)."""
import sys
import re

path = sys.argv[1]

with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Replace heading "11 microservice" → "12 microservice"
content = content.replace("## 📁 11 microservice", "## 📁 12 microservice")
content = content.replace("## 11 microservice", "## 12 microservice")

# 2. Insert customer row after contract row in the table.
#    Find the `/contract/…` row and add customer row right after it.
customer_row = "| `/customer/…` | [customer/](./customer/) | Customer entity CRUD, lifecycle, telesale assignment, segment/source/relationship | **Legacy prefix `/adminapi/customer/*`** cũng thuộc domain này |\n"
# Find contract row (any line starting with `| `/contract/…`)
pattern_contract = re.compile(r"(\| `/contract/….*?\n)", re.MULTILINE)
m = pattern_contract.search(content)
if m:
    insert_pos = m.end()
    if "| `/customer/" not in content:
        content = content[:insert_pos] + customer_row + content[insert_pos:]

# 3. Update "care" description to clarify it does NOT own customer entity
content = re.sub(
    r"\| `/care/….*?\n",
    "| `/care/…` | [care/](./care/) | Ticket, feedback, warranty, chăm sóc **sau bán**. KHÔNG owns customer entity (thuộc `customer/`) |\n",
    content,
    count=1,
)

# 4. Add "customer vs care" distinction after the existing "Phân biệt dễ nhầm" section
#    Only add if not already present.
if "`customer/` vs `care/`" not in content:
    distinction_line = "- **`customer/` vs `care/`**: `customer` owns data entity + lifecycle (CRUD, assignment, segment, source, telesale pipeline); `care` owns post-sale support (ticket, feedback, warranty, complaint).\n"
    # Insert before "`care/` vs `notification/`" line
    content = content.replace(
        "- **`care/` vs `notification/`",
        distinction_line + "- **`care/` vs `notification/`",
    )

# 5. Update cross-branch list to show "Task đang mở" section references customer if present
#    Also update "Các microservice chưa có task" to include customer if it wasn't before
#    (Only append if 11 items listed and customer missing)
# Find a line like "- [billing/](./billing/) · [care/]..."
# If customer/ not in that list, add it
pattern_chua_co = re.compile(
    r"- \[billing/\]\(\./billing/\)(?![^\n]*customer)([^\n]*)",
    re.MULTILINE,
)
m2 = pattern_chua_co.search(content)
if m2 and "- [customer/]" not in content:
    rest = m2.group(1)
    # Check if line contains "care/" — if so, insert customer/ after care
    if "[care/](./care/)" in rest:
        new_rest = rest.replace(
            "[care/](./care/)",
            "[care/](./care/) · [customer/](./customer/)",
        )
        content = content.replace(m2.group(0), f"- [billing/](./billing/){new_rest}")

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"Updated: {path}")
