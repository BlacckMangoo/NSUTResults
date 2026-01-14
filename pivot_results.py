import pandas as pd
import csv

INPUT_FILE = "results_clean.csv"
OUTPUT_FILE = "results_pivot.csv"

# Read the CSV
df = pd.read_csv(INPUT_FILE)

# Group by student and build variable-width rows
rows = []

for (roll_no, student_name), group in df.groupby(["roll_no", "student_name"]):
    row = [roll_no, student_name]
    
    # Get original SGPA from Excel (same for all records of this student)
    original_sgpa = group.iloc[0]["sgpa"]
    
    for _, record in group.iterrows():
        subject_code = record["subject_code"]
        grade_point = record["grade_point"]
        row.append(subject_code)
        row.append(grade_point)
    
    # Use original SGPA from Excel, not calculated
    row.append(original_sgpa)
    
    rows.append(row)

# Write CSV with variable columns per row
with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    # Header row showing the pattern
    writer.writerow(["roll_no", "student_name", "subject1", "gp1", "subject2", "gp2", "...", "sgpa"])
    for row in rows:
        writer.writerow(row)

print(f"Pivot CSV generated: {OUTPUT_FILE}")
print(f"Total students: {len(rows)}")
