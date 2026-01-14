import pandas as pd
import re
import csv

SEMESTERS = [
    {"input": "Gazette Report B Tech Sem 1 2025-26.xlsx", "clean": "results_sem1_clean.csv", "pivot": "results_sem1_pivot.csv"},
    {"input": "Gazette Report B Tech Sem 5 2025-26.xlsx", "clean": "results_sem5_clean.csv", "pivot": "results_sem5_pivot.csv"},
]

def find_header_row(df):
    """Find the row index containing 'Roll No' header."""
    for idx, row in df.iterrows():
        row_str = " ".join(str(cell) for cell in row if pd.notna(cell))
        if "Roll No" in row_str or "Roll" in row_str:
            return idx
    return None

def extract_non_nan_values(row):
    """Extract non-NaN values from a row, preserving order."""
    return [cell for cell in row if pd.notna(cell)]

def parse_student_row(values):
    """
    Parse a cleaned row of student data.
    Expected pattern: Sl, Roll No, Name\nFather's Name, [Sub, GR, GP] x N, SGPA
    """
    if len(values) < 6:
        return None
    
    # First value is serial number, skip it
    # Second value is roll number
    roll_no = str(values[1]).strip()
    
    # Validate roll number format (starts with year like 2024, 2023, 2022, etc.)
    if not re.match(r"20\d{2}[A-Z]{3}\d+", roll_no):
        return None
    
    # Third value is Name\nFather's Name
    name_field = str(values[2]).strip()
    # Extract first and second name (first two words before newline, removing father's name)
    if "\n" in name_field:
        name_field = name_field.split("\n")[0].strip()
    name_parts = name_field.split()
    student_name = " ".join(name_parts[:2]) if len(name_parts) >= 2 else name_field
    
    # Last value is SGPA
    try:
        sgpa = float(values[-2])
    except (ValueError, IndexError):
        return None
    
    # Middle values are subject blocks: Sub, GR, GP (skipping credit-related values)
    subject_values = values[3:-4]
    subjects = []
    
    i = 0
    while i + 3 < len(subject_values):
        sub_cr = str(subject_values[i])
        
        # Subject code pattern: letters followed by numbers (optionally with credit number)
        match = re.match(r"([A-Z]+\d+)\s*\d*", sub_cr)
        if match:
            subject_code = match.group(1)
            grade = str(subject_values[i + 1])
            grade_point = int(float(subject_values[i + 2]))
            
            subjects.append({
                "subject_code": subject_code,
                "grade": grade,
                "grade_point": grade_point
            })
            i += 4
        else:
            i += 1
    
    return {
        "roll_no": roll_no,
        "student_name": student_name,
        "subjects": subjects,
        "sgpa": sgpa
    }

def process_excel(input_file, clean_output, pivot_output):
    rows_out = []
    
    xls = pd.ExcelFile(input_file)
    
    for sheet_name in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name, header=None)
        
        header_row_idx = find_header_row(df)
        if header_row_idx is None:
            continue
        
        # Process rows after header
        for idx in range(header_row_idx + 1, len(df)):
            row = df.iloc[idx]
            values = extract_non_nan_values(row)
            
            if len(values) < 8:
                continue
            
            student_data = parse_student_row(values)
            if student_data is None:
                continue
            
            # Create one row per subject for the student
            for subj in student_data["subjects"]:
                rows_out.append({
                    "roll_no": student_data["roll_no"],
                    "student_name": student_data["student_name"],
                    "subject_code": subj["subject_code"],
                    "grade": subj["grade"],
                    "grade_point": subj["grade_point"],
                    "sgpa": student_data["sgpa"]
                })
    
    # Save clean CSV
    out_df = pd.DataFrame(rows_out)
    out_df.to_csv(clean_output, index=False)
    print(f"Clean CSV: {clean_output} ({len(rows_out)} records)")
    
    # Create pivot CSV
    pivot_rows = []
    for (roll_no, student_name), group in out_df.groupby(["roll_no", "student_name"]):
        row = [roll_no, student_name]
        original_sgpa = group.iloc[0]["sgpa"]
        
        for _, record in group.iterrows():
            row.append(record["subject_code"])
            row.append(record["grade_point"])
        
        row.append(original_sgpa)
        pivot_rows.append(row)
    
    with open(pivot_output, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["roll_no", "student_name", "subject1", "gp1", "subject2", "gp2", "...", "sgpa"])
        for row in pivot_rows:
            writer.writerow(row)
    
    print(f"Pivot CSV: {pivot_output} ({len(pivot_rows)} students)")
    return len(pivot_rows)

# Process all semesters
for sem in SEMESTERS:
    print(f"\nProcessing {sem['input']}...")
    process_excel(sem["input"], sem["clean"], sem["pivot"])
