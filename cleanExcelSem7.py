import pandas as pd
import re

INPUT_FILE = "Gazette Report B Tech Sem 7 2025-26.xlsx"
OUTPUT_FILE = "results_sem7_clean.csv"

rows_out = []

xls = pd.ExcelFile(INPUT_FILE)

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

for sheet_name in xls.sheet_names:
    df = pd.read_excel(xls, sheet_name, header=None)
    
    header_row_idx = find_header_row(df)
    if header_row_idx is None:
        continue
    
    # Process rows after header
    for idx in range(header_row_idx + 1, len(df)):
        row = df.iloc[idx]
        values = extract_non_nan_values(row)
        
        if len(values) < 8:  # Minimum: Sl, Roll, Name, 1 subject (4 vals), TOT CR, TOT CRP, SGPA, CS
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

out_df = pd.DataFrame(rows_out)
out_df.to_csv(OUTPUT_FILE, index=False)

print(f"CSV generated: {OUTPUT_FILE}")
print(f"Total records: {len(rows_out)}")
