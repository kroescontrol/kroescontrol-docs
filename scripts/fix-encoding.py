#!/usr/bin/env python3
"""
Encoding Issues Fixer voor KroesControl Docs
Lost automatisch encoding problemen op die gedetecteerd zijn door analyze-encoding.py
"""

import os
import sys
import re
import shutil
import subprocess
from pathlib import Path

# Emoji vervangingen voor git-crypt compatibiliteit
EMOJI_REPLACEMENTS = {
    '🔄': '[WIP]',
    '✅': '[OK]',
    '⚠️': '[WARN]',
    '🟢': '[OK]',
    '🟡': '[WARN]',
    '🔴': '[ERROR]',
    '🎯': '[TARGET]',
    '⭐': '[STAR]',
    '🏃‍♂️': '[RUNNING]',
    '👨‍💻': '[DEV]',
    '🧪': '[TEST]',
    '👩‍💻': '[DEV]',
    '🚀': '[DEPLOY]',
    '💻': '[CODE]',
    '📝': '[DOCS]',
    '🔍': '[SEARCH]',
    '📊': '[STATS]',
    '💡': '[TIP]',
    '🎉': '[SUCCESS]',
    '💥': '[ERROR]',
    '🌿': '[BRANCH]',
    '🧩': '[MODULE]'
}

def is_git_crypt_encrypted(file_path):
    """Check of een bestand geconfigureerd is voor git-crypt encryption"""
    try:
        # Gebruik git-crypt status om te checken of bestand encrypted is
        result = subprocess.run(['git-crypt', 'status', file_path], 
                              capture_output=True, text=True, check=False)
        if result.returncode == 0:
            # Parse output - check verschillende formaten
            output = result.stdout.strip()
            # Format kan zijn: "    encrypted: file" of "encrypted: file"
            is_encrypted = ('    encrypted:' in output or 
                          output.startswith('encrypted:'))
            return is_encrypted
        return False
    except (subprocess.CalledProcessError, FileNotFoundError):
        # Als git-crypt niet beschikbaar is, assume niet encrypted
        return False

def is_git_crypt_file_readable(file_path):
    """Check of een git-crypt bestand momenteel leesbaar is (unlocked state)"""
    try:
        # Probeer het bestand te lezen als tekst
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read(100)  # Lees eerste 100 karakters
            
        # Als het begint met git-crypt binary marker, dan is het nog encrypted
        if content.startswith('\x00GITCRYPT\x00'):
            return False
            
        # Als we normale tekst kunnen lezen, dan is het unlocked
        # Check op normale markdown/tekst patronen
        if any(marker in content for marker in ['---\n', '# ', '## ', 'title:', 'description:']):
            return True
            
        # Als het vooral printable tekst is, waarschijnlijk unlocked
        printable_chars = sum(1 for c in content if c.isprintable() or c in '\n\r\t')
        if len(content) > 0 and (printable_chars / len(content)) > 0.8:
            return True
            
        return False
        
    except (UnicodeDecodeError, IOError):
        # Kan niet als tekst gelezen worden = waarschijnlijk nog encrypted
        return False

def backup_file(file_path, create_backup=False):
    """Maak backup van bestand voordat we het wijzigen"""
    if not create_backup:
        return None
    backup_path = f"{file_path}.backup"
    if not os.path.exists(backup_path):
        shutil.copy2(file_path, backup_path)
        return backup_path
    return None

def fix_file_encoding(file_path, dry_run=False, create_backup=False):
    """Fix encoding problemen in een bestand"""
    fixes_applied = []
    
    # Check of bestand git-crypt encrypted is
    is_encrypted = is_git_crypt_encrypted(file_path)
    
    if is_encrypted:
        # Als het git-crypt encrypted is, check of het leesbaar is (unlocked)
        if is_git_crypt_file_readable(file_path):
            fixes_applied.append("INFO: Git-crypt bestand in unlocked state - kan veilig bewerkt worden")
        else:
            fixes_applied.append("SKIP: Git-crypt bestand is nog encrypted - run eerst 'git-crypt unlock'")
            return fixes_applied
    
    try:
        # Probeer eerst normale UTF-8 read
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            # Als dat faalt, probeer verschillende encodings
            encodings_to_try = ['utf-8-sig', 'latin1', 'cp1252', 'iso-8859-1']
            content = None
            
            for encoding in encodings_to_try:
                try:
                    with open(file_path, 'r', encoding=encoding) as f:
                        content = f.read()
                    fixes_applied.append(f"Decoded met {encoding} encoding")
                    break
                except UnicodeDecodeError:
                    continue
            
            if content is None:
                fixes_applied.append("FOUT: Kan bestand niet decoderen met standaard encodings")
                return fixes_applied
        
        original_content = content
        
        # Fix 1: Verwijder BOM als aanwezig
        if content.startswith('\ufeff'):
            content = content[1:]
            fixes_applied.append("UTF-8 BOM header verwijderd")
        
        # Fix 2: Vervang Unicode replacement characters
        if '�' in content:
            # Probeer intelligente vervanging
            content = content.replace('�', '?')
            fixes_applied.append("Unicode replacement characters vervangen met '?'")
        
        # Fix 3: Vervang problematische emoji's
        emoji_fixes = []
        for emoji, replacement in EMOJI_REPLACEMENTS.items():
            if emoji in content:
                content = content.replace(emoji, replacement)
                emoji_fixes.append(f"'{emoji}' → '{replacement}'")
        
        if emoji_fixes:
            fixes_applied.append(f"Emoji's vervangen: {', '.join(emoji_fixes)}")
        
        # Fix 4: Normaliseer line endings naar LF
        if '\r\n' in content:
            content = content.replace('\r\n', '\n')
            fixes_applied.append("CRLF line endings genormaliseerd naar LF")
        
        # Fix 5: Verwijder trailing whitespace
        lines = content.splitlines()
        cleaned_lines = [line.rstrip() for line in lines]
        if lines != cleaned_lines:
            content = '\n'.join(cleaned_lines)
            if content and not content.endswith('\n'):
                content += '\n'
            fixes_applied.append("Trailing whitespace verwijderd")
        
        # Fix 6: Verwijder non-printable characters (behalve tabs en newlines)
        non_printable_pattern = r'[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\x9f]'
        if re.search(non_printable_pattern, content):
            content = re.sub(non_printable_pattern, '', content)
            fixes_applied.append("Non-printable characters verwijderd")
        
        # Schrijf alleen als er wijzigingen zijn
        if content != original_content and not dry_run:
            # Maak backup indien gewenst
            backup_path = backup_file(file_path, create_backup)
            if backup_path:
                fixes_applied.append(f"Backup gemaakt: {backup_path}")
            
            # Schrijf gefixte content
            with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
                f.write(content)
            fixes_applied.append("Bestand opgeslagen met correcte UTF-8 encoding")
        
        elif content == original_content:
            fixes_applied.append("Geen wijzigingen nodig")
            
    except Exception as e:
        fixes_applied.append(f"FOUT bij verwerken: {e}")
    
    return fixes_applied

def fix_repository(dry_run=False, create_backup=False):
    """Fix encoding problemen in hele repository"""
    print("🔧 Encoding Issues Fixer")
    print("=" * 50)
    
    if dry_run:
        print("🔍 DRY RUN MODE - geen bestanden worden gewijzigd")
        print()
    
    # Directories om te scannen
    scan_dirs = ['docs-public', 'docs-internal', 'docs-finance', 'docs-operation', 'docs-test-auth']
    
    total_files = 0
    files_fixed = 0
    all_fixes = {}
    
    for scan_dir in scan_dirs:
        if not os.path.exists(scan_dir):
            continue
            
        print(f"📁 Fixing: {scan_dir}/")
        
        # Zoek alle .md bestanden
        for root, dirs, files in os.walk(scan_dir):
            for file in files:
                if file.endswith('.md'):
                    file_path = os.path.join(root, file)
                    relative_path = os.path.relpath(file_path)
                    
                    total_files += 1
                    fixes = fix_file_encoding(file_path, dry_run, create_backup)
                    
                    if len(fixes) > 1 or (len(fixes) == 1 and "Geen wijzigingen nodig" not in fixes[0]):
                        files_fixed += 1
                        all_fixes[relative_path] = fixes
                        print(f"  🔧 {relative_path}")
                        for fix in fixes:
                            print(f"     • {fix}")
                    else:
                        print(f"  ✅ {relative_path} (geen fixes nodig)")
    
    # Samenvatting
    print(f"\n📊 Samenvatting:")
    print(f"   Totaal bestanden: {total_files}")
    print(f"   Bestanden gefixed: {files_fixed}")
    print(f"   Percentage gefixed: {(files_fixed / total_files * 100):.1f}%")
    
    if all_fixes:
        print(f"\n✨ Succesvol gefixte bestanden:")
        for file_path, fixes in all_fixes.items():
            print(f"   • {file_path} ({len(fixes)} fixes)")
    
    if not dry_run and files_fixed > 0:
        print(f"\n💡 TIP: Run 'python3 scripts/analyze-encoding.py' om resultaat te verifiëren")
        if create_backup:
            print(f"💡 TIP: Backup bestanden zijn gemaakt met .backup extensie")
    
    return files_fixed

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Fix encoding issues in KroesControl Docs')
    parser.add_argument('--dry-run', action='store_true', 
                       help='Show what would be fixed without making changes')
    parser.add_argument('--backup', action='store_true',
                       help='Create .backup files before making changes')
    parser.add_argument('--file', type=str,
                       help='Fix specific file instead of entire repository')
    
    args = parser.parse_args()
    
    if args.file:
        if not os.path.exists(args.file):
            print(f"❌ Bestand niet gevonden: {args.file}")
            sys.exit(1)
        
        print(f"🔧 Fixing: {args.file}")
        fixes = fix_file_encoding(args.file, args.dry_run, args.backup)
        for fix in fixes:
            print(f"   • {fix}")
    else:
        files_fixed = fix_repository(args.dry_run, args.backup)
        sys.exit(0 if files_fixed >= 0 else 1)

if __name__ == "__main__":
    main()