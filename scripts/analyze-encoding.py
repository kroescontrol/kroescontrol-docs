#!/usr/bin/env python3
"""
Encoding Issues Analyzer voor KroesControl Docs
Analyseert alle markdown bestanden op encoding problemen
"""

import os
import sys
import re
from pathlib import Path

def check_file_encoding(file_path):
    """Check een bestand op encoding problemen"""
    issues = []
    
    try:
        # Probeer bestand te lezen als UTF-8
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            lines = content.splitlines()
            
        # Check voor Unicode replacement character
        if '�' in content:
            issue_lines = [i+1 for i, line in enumerate(lines) if '�' in line]
            issues.append(f"Unicode replacement character (�) gevonden op regels: {issue_lines}")
            
        # Check voor problematische emoji's die CRLF warnings veroorzaken
        problematic_emojis = [
            '🔄', '✅', '⚠️', '🟢', '🟡', '🔴', '🎯', '⭐', 
            '🏃‍♂️', '👨‍💻', '🧪', '👩‍💻', '🚀', '💻', '📝',
            '🔍', '📊', '💡', '🎉', '💥', '🌿', '🧩'
        ]
        
        for emoji in problematic_emojis:
            if emoji in content:
                emoji_lines = [i+1 for i, line in enumerate(lines) if emoji in line]
                issues.append(f"Problematische emoji '{emoji}' gevonden op regels: {emoji_lines}")
        
        # Check voor CRLF line endings
        if '\r\n' in content:
            issues.append("CRLF line endings gedetecteerd (moet LF zijn)")
            
        # Check voor BOM
        if content.startswith('\ufeff'):
            issues.append("UTF-8 BOM header gedetecteerd")
            
        # Check voor non-printable characters (behalve normale whitespace)
        non_printable = re.findall(r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]', content)
        if non_printable:
            issues.append(f"Non-printable characters gevonden: {set(non_printable)}")
            
    except UnicodeDecodeError as e:
        issues.append(f"Kan bestand niet lezen als UTF-8: {e}")
    except Exception as e:
        issues.append(f"Onbekende fout: {e}")
        
    return issues

def analyze_repository():
    """Analyseer alle markdown bestanden in de repository"""
    print("🔍 Encoding Issues Analyzer")
    print("=" * 50)
    
    # Directories om te scannen
    scan_dirs = ['docs-public', 'docs-internal', 'docs-finance', 'docs-operation', 'docs-test-auth']
    
    total_files = 0
    files_with_issues = 0
    all_issues = {}
    
    for scan_dir in scan_dirs:
        if not os.path.exists(scan_dir):
            continue
            
        print(f"\n📁 Scannen: {scan_dir}/")
        
        # Zoek alle .md bestanden
        for root, dirs, files in os.walk(scan_dir):
            for file in files:
                if file.endswith('.md'):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path)
                    
                    total_files += 1
                    issues = check_file_encoding(file_path)
                    
                    if issues:
                        files_with_issues += 1
                        all_issues[relative_path] = issues
                        print(f"  ❌ {relative_path}")
                        for issue in issues:
                            print(f"     • {issue}")
                    else:
                        print(f"  ✅ {relative_path}")
    
    # Samenvatting
    print(f"\n📊 Samenvatting:")
    print(f"   Totaal bestanden: {total_files}")
    print(f"   Bestanden met issues: {files_with_issues}")
    print(f"   Percentage clean: {((total_files - files_with_issues) / total_files * 100):.1f}%")
    
    if all_issues:
        print(f"\n🔧 Bestanden die aandacht nodig hebben:")
        for file_path, issues in all_issues.items():
            print(f"   • {file_path} ({len(issues)} issues)")
    
    return len(all_issues) == 0

if __name__ == "__main__":
    success = analyze_repository()
    sys.exit(0 if success else 1)