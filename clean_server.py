#!/usr/bin/env python3
# Script to clean server.ts by keeping only first 903 lines

with open('server.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Keep first 903 lines (0-902 in 0-indexed)
clean_lines = lines[:903]

# Write back
with open('server.ts', 'w', encoding='utf-8') as f:
    f.writelines(clean_lines)

print(f"File cleaned. Kept {len(clean_lines)} lines.")
