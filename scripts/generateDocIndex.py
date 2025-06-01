#!/usr/bin/env python3
"""
Documentation Index Generator - Scant documentatie uit meerdere directories

Gebruik:
    python3 scripts/generateDocIndex.py [output_dir]
    
Dit script scant automatisch:
    - ./old/   (legacy documentatie - wordt later verwijderd)
    - ./input/ (nieuwe input documentatie)
    
Voorbeelden:
    python3 scripts/generateDocIndex.py         # Genereert index in ./legacy-docs-index.md
    python3 scripts/generateDocIndex.py output  # Genereert index in ./output/index.md
    
Het script genereert een uitgebreide index.md met:
- Inhoudsopgave per categorie
- Metadata per bestand (grootte, datum, keywords)
- Cross-references tussen bestanden
- Keyword clustering
- Bronvermelding per bestand (old/ of input/)
"""

import os
import re
from pathlib import Path
from datetime import datetime
import mimetypes
import sys

class MultiSourceDocScanner:
    def __init__(self, source_dirs=None, output_dir='.'):
        """
        Initialize scanner met meerdere bron directories
        
        Args:
            source_dirs: List van directories om te scannen (default: ['old', 'input'])
            output_dir: Directory waar index.md wordt gegenereerd
        """
        self.source_dirs = source_dirs or ['old', 'input']
        self.output_dir = Path(output_dir)
        self.file_registry = {}
        self.stats = {
            'total_files': 0,
            'files_per_source': {},
            'skipped_files': 0
        }
        
    def scan_all_directories(self):
        """Scan alle geconfigureerde source directories"""
        print("🔍 Multi-source document scanner gestart...")
        print(f"📂 Scanning directories: {', '.join(self.source_dirs)}")
        print("-" * 50)
        
        for source_dir in self.source_dirs:
            source_path = Path(source_dir)
            if source_path.exists() and source_path.is_dir():
                print(f"\n📁 Scanning: {source_dir}/")
                self.scan_directory(source_path, source_dir)
            else:
                print(f"⚠️  Directory '{source_dir}' niet gevonden, skipping...")
        
        # Genereer de gecombineerde index
        self.generate_combined_index()
        
    def scan_directory(self, directory_path, source_label):
        """Scan een specifieke directory met source label"""
        files_found = 0
        
        for path in directory_path.rglob('*'):
            if path.is_file() and self.is_doc_file(path):
                # Skip index.md bestanden in de source directories
                if path.name == 'index.md' and path.parent == directory_path:
                    continue
                    
                self.process_file(path, directory_path, source_label)
                files_found += 1
        
        self.stats['files_per_source'][source_label] = files_found
        self.stats['total_files'] += files_found
        print(f"   ✓ {files_found} bestanden gevonden")
        
    def is_doc_file(self, path):
        """Check of het bestand documentatie is"""
        doc_extensions = {'.md', '.txt', '.rst', '.adoc', '.html', '.pdf', 
                         '.doc', '.docx', '.yaml', '.yml', '.json', '.xml'}
        code_extensions = {'.py', '.js', '.java', '.cpp', '.h', '.sql'}
        
        # Skip gegenereerde/temp bestanden
        skip_patterns = ['node_modules', '.git', '__pycache__', '.env', 'venv']
        if any(skip in str(path) for skip in skip_patterns):
            self.stats['skipped_files'] += 1
            return False
            
        return path.suffix.lower() in (doc_extensions | code_extensions)
    
    def extract_content_summary(self, file_path):
        """Extract belangrijke informatie uit bestand"""
        summary = {
            'path': file_path,
            'type': file_path.suffix,
            'size': file_path.stat().st_size,
            'modified': datetime.fromtimestamp(file_path.stat().st_mtime),
            'content': '',
            'headers': [],
            'keywords': [],
            'code_blocks': [],
            'links': []
        }
        
        try:
            # Lees bestand (met encoding handling)
            encodings = ['utf-8', 'latin-1', 'cp1252']
            content = None
            
            for encoding in encodings:
                try:
                    content = file_path.read_text(encoding=encoding)
                    break
                except UnicodeDecodeError:
                    continue
            
            if not content:
                return summary
            
            # Extract eerste 500 karakters voor preview
            summary['content'] = content[:500].strip()
            
            # Extract headers (Markdown/RST)
            if file_path.suffix in ['.md', '.rst']:
                headers = re.findall(r'^#{1,6}\s+(.+)$', content, re.MULTILINE)
                summary['headers'] = headers[:5]  # Eerste 5 headers
            
            # Extract belangrijke keywords
            keywords = self.extract_keywords(content)
            summary['keywords'] = keywords
            
            # Extract code block talen
            code_blocks = re.findall(r'```(\w+)', content)
            summary['code_blocks'] = list(set(code_blocks))
            
            # Extract links naar andere bestanden
            links = re.findall(r'\[.*?\]\((.*?)\)', content)
            summary['links'] = [l for l in links if not l.startswith('http')]
            
        except Exception as e:
            print(f"   ⚠️  Error reading {file_path}: {e}")
            
        return summary
    
    def extract_keywords(self, content):
        """Extract belangrijke keywords uit content"""
        # Uitgebreide keyword lijst voor Kroescontrol context
        important_words = [
            # Technical keywords
            'api', 'database', 'config', 'setup', 'install', 
            'authentication', 'authorization', 'endpoint', 'schema',
            'migration', 'deployment', 'docker', 'kubernetes',
            # Kroescontrol specifiek
            'budget', 'mobility', 'engineer', 'freelancecontrol',
            'onboarding', 'hoorayhr', 'clockify', 'pensioen',
            'verzekering', 'contract', 'facturatie', 'declaratie'
        ]
        
        content_lower = content.lower()
        found_keywords = []
        
        for word in important_words:
            if word in content_lower:
                found_keywords.append(word)
                
        # Ook zoek naar TODO, FIXME, WARNING, etc.
        markers = re.findall(r'(TODO|FIXME|WARNING|DEPRECATED|IMPORTANT):', 
                           content, re.IGNORECASE)
        found_keywords.extend(set(markers))
        
        return found_keywords[:10]  # Max 10 keywords
    
    def process_file(self, file_path, source_root, source_label):
        """Verwerk een enkel bestand met source tracking"""
        relative_path = file_path.relative_to(source_root)
        summary = self.extract_content_summary(file_path)
        
        # Voeg source label toe aan summary
        summary['source'] = source_label
        
        # Categoriseer op basis van pad/naam
        category = self.categorize_file(relative_path, source_label)
        
        if category not in self.file_registry:
            self.file_registry[category] = []
            
        self.file_registry[category].append({
            'path': relative_path,
            'source': source_label,
            'summary': summary
        })
        
        print(f"   ✓ {source_label}/{relative_path}")
    
    def categorize_file(self, path, source_label):
        """Categoriseer bestand op basis van pad, naam en source"""
        path_str = str(path).lower()
        
        # Source-specifieke categorisatie
        if source_label == 'old':
            category_prefix = "Legacy - "
        elif source_label == 'input':
            category_prefix = "New Input - "
        else:
            category_prefix = ""
        
        # Kroescontrol-specifieke categorisatie
        if 'hr' in path_str or 'onboarding' in path_str:
            return f"{category_prefix}HR & Onboarding"
        elif 'werkafspraken' in path_str or 'budget' in path_str:
            return f"{category_prefix}Werkafspraken & Budgetten"
        elif 'administratie' in path_str or 'finance' in path_str or 'facturatie' in path_str:
            return f"{category_prefix}Administratie & Finance"
        elif 'freelancecontrol' in path_str:
            return f"{category_prefix}Freelancecontrol"
        elif 'klanten' in path_str or 'inhuur' in path_str:
            return f"{category_prefix}Klanten & Inhuur"
        elif 'documentatie' in path_str or 'docs' in path_str:
            return f"{category_prefix}Documentatie"
        elif 'api' in path_str:
            return f"{category_prefix}API Documentation"
        elif 'database' in path_str or 'db' in path_str:
            return f"{category_prefix}Database"
        elif 'config' in path_str or 'setup' in path_str:
            return f"{category_prefix}Configuration & Setup"
        else:
            return f"{category_prefix}Algemeen"
    
    def generate_combined_index(self):
        """Genereer de gecombineerde index.md"""
        print(f"\n📝 Generating combined index...")
        
        # Bepaal output bestand(en)
        if self.output_dir == Path('.'):
            # Zonder opties: sla op in ./old/index.md en ./input/index.md
            output_files = [Path('old/index.md'), Path('input/index.md')]
        else:
            self.output_dir.mkdir(exist_ok=True)
            output_files = [self.output_dir / 'index.md']
        
        # Header met statistieken
        output = [
            "# 📚 Legacy & Input Documentation Index",
            f"\n*Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M')}*",
            f"\n*Total files scanned: {self.stats['total_files']}*\n"
        ]
        
        # Source breakdown
        if self.stats['files_per_source']:
            output.append("### 📊 Files per source:")
            for source, count in self.stats['files_per_source'].items():
                output.append(f"- **{source}/**: {count} bestanden")
        
        output.extend([
            f"\n*Skipped files: {self.stats['skipped_files']}*",
            "\n---\n",
            "## 📑 Table of Contents\n"
        ])
        
        # Inhoudsopgave
        for category in sorted(self.file_registry.keys()):
            count = len(self.file_registry[category])
            anchor = self.create_anchor(category)
            output.append(f"- [{category}](#{anchor}) ({count} files)")
        
        output.append("\n---\n")
        
        # Quick Reference sectie
        output.append("## 🚀 Quick Reference\n")
        output.append("### Most Important Files\n")
        
        # Vind belangrijkste bestanden
        all_files = []
        for category, files in self.file_registry.items():
            all_files.extend(files)
        
        # Sorteer op aantal keywords en grootte
        important_files = sorted(all_files, 
                               key=lambda x: (len(x['summary']['keywords']), 
                                            x['summary']['size']), 
                               reverse=True)[:10]
        
        for file_info in important_files:
            source = file_info['source']
            path = file_info['path']
            keywords = file_info['summary']['keywords']
            output.append(f"- **[{source}/{path}](./{source}/{path})** - Keywords: {', '.join(keywords[:3])}")
        
        output.append("\n---\n")
        
        # Per categorie
        for category in sorted(self.file_registry.keys()):
            anchor = self.create_anchor(category)
            output.append(f"## {category} {{#{anchor}}}\n")
            
            files = sorted(self.file_registry[category], 
                         key=lambda x: (x['source'], str(x['path'])))
            
            for file_info in files:
                source = file_info['source']
                path = file_info['path']
                summary = file_info['summary']
                
                output.append(f"### 📄 [{source}/{path}](./{source}/{path})\n")
                
                # Bestandsinfo met source badge
                output.append(f"- **Source**: `{source}` | ")
                output.append(f"**Type**: `{summary['type']}` | ")
                output.append(f"**Size**: {summary['size']:,} bytes | ")
                output.append(f"**Modified**: {summary['modified'].strftime('%Y-%m-%d')}\n")
                
                # Keywords
                if summary['keywords']:
                    output.append(f"- **Keywords**: `{' | '.join(summary['keywords'])}`\n")
                
                # Headers
                if summary['headers']:
                    output.append(f"- **Sections**: \n")
                    for header in summary['headers']:
                        output.append(f"  - {header}\n")
                
                # Code blocks
                if summary['code_blocks']:
                    output.append(f"- **Code Examples**: {', '.join(summary['code_blocks'])}\n")
                
                # Content preview
                if summary['content']:
                    preview = summary['content'].replace('\n', ' ')[:200]
                    output.append(f"\n**Preview**:\n> {preview}...\n")
                
                # Links naar andere bestanden
                if summary['links']:
                    output.append(f"\n**References**: ")
                    output.append(', '.join(f"[{link}]({link})" for link in summary['links'][:3]))
                    output.append("\n")
                
                output.append("\n---\n")
        
        # Cross-reference sectie
        output.append("\n## 🔗 Cross-References\n")
        self.generate_cross_references(output)
        
        # Migration notes
        output.extend([
            "\n## 📋 Migration Notes\n",
            "- **old/**: Legacy documentatie die gemigreerd moet worden naar de nieuwe structuur",
            "- **input/**: Nieuwe input documenten voor verwerking in de documentatie",
            "\nNa migratie kan de `old/` directory verwijderd worden en blijft alleen `input/` over voor toekomstige toevoegingen."
        ])
        
        # Schrijf naar bestand(en)
        content = '\n'.join(output)
        for output_file in output_files:
            # Zorg dat parent directory bestaat
            output_file.parent.mkdir(exist_ok=True)
            output_file.write_text(content)
            print(f"\n✅ Index generated: {output_file}")
            
        print(f"   Total categories: {len(self.file_registry)}")
        print(f"   Total files indexed: {self.stats['total_files']}")
        
    def create_anchor(self, category):
        """Create a valid anchor from category name"""
        return category.lower().replace(' ', '-').replace('&', 'and').replace('-', '')
        
    def generate_cross_references(self, output):
        """Genereer cross-reference matrix"""
        # Vind bestanden die naar elkaar linken
        references = {}
        
        for category, files in self.file_registry.items():
            for file_info in files:
                source = f"{file_info['source']}/{file_info['path']}"
                links = file_info['summary']['links']
                
                if links:
                    references[source] = links
        
        if references:
            output.append("\n### File Dependencies\n")
            for source, targets in sorted(references.items()):
                if targets:
                    output.append(f"- `{source}` → {', '.join(f'`{t}`' for t in targets[:3])}")
        
        # Keyword clustering
        keyword_files = {}
        for category, files in self.file_registry.items():
            for file_info in files:
                for keyword in file_info['summary']['keywords']:
                    if keyword not in keyword_files:
                        keyword_files[keyword] = []
                    keyword_files[keyword].append(f"{file_info['source']}/{file_info['path']}")
        
        output.append("\n### Files by Topic\n")
        for keyword, files in sorted(keyword_files.items()):
            if len(files) > 1:  # Alleen tonen als meerdere bestanden
                output.append(f"- **{keyword}**: {', '.join(f'`{f}`' for f in files[:5])}")


if __name__ == '__main__':
    # Default source directories
    default_sources = ['old', 'input']
    
    # Check command line arguments
    if len(sys.argv) > 1:
        output_dir = sys.argv[1]
    else:
        output_dir = '.'
    
    # Initialiseer scanner
    scanner = MultiSourceDocScanner(
        source_dirs=default_sources,
        output_dir=output_dir
    )
    
    # Start scanning
    scanner.scan_all_directories()
    
    print("\n🎉 Done! Check the generated index for the complete documentation overview.")