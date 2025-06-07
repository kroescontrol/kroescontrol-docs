# CLAUDE.md

Dit bestand biedt richtlijnen voor Claude Code (claude.ai/code) bij het werken met code in deze repository.

## 🧩 Modulaire Prompt Structuur

Alle Claude Code prompts zijn verdeeld over modulaire bestanden voor betere onderhoudbaarheid:

### Core Prompt Modules
- **Basis Richtlijnen**: `./docs-internal/tools/claudecode/prompt/CLAUDE_basis.md`
- **Repository Structuur**: `./docs-internal/tools/claudecode/prompt/CLAUDE_structuur.md`
- **Content Conventies**: `./docs-internal/tools/claudecode/prompt/CLAUDE_content.md`
- **DocStatus Systeem**: `./docs-internal/tools/claudecode/prompt/CLAUDE_docstatus.md`
- **Obfuscation Systeem**: `./docs-internal/tools/claudecode/prompt/CLAUDE_obfuscation.md`
- **Deployment Richtlijnen**: `./docs-internal/tools/claudecode/prompt/CLAUDE_deployment.md`
- **Workflow Commando's**: `./docs-internal/tools/claudecode/prompt/CLAUDE_workflow.md`

### Project Context
- **Project Context**: `./docs-internal/tools/claudecode/context/project-context.md`
- **Migratie Status**: `./docs-internal/tools/claudecode/context/migration-status.md`

## 🚀 Quick Start

Voor Claude Code sessies:

1. **Lees altijd eerst**: `./docs-internal/tools/claudecode/prompt/CLAUDE_basis.md`
2. **Check project context**: `./docs-internal/tools/claudecode/context/project-context.md`
3. **Voor gevoelige documentatie**: `./docs-internal/tools/claudecode/prompt/CLAUDE_obfuscation.md`
4. **Specifieke modules**: Raadpleeg relevante prompt modules voor gedetailleerde instructies

## 📖 Belangrijke Templates

- **Document template**: Gebruik standaard Markdown structuur met frontmatter
- **PROMPT.md template**: Zie CLAUDE_structuur.md sectie "PROMPT.md Methode"

## 🎯 Quick Reference

**Taal**: Nederlands voor interne communicatie
**Verwijzingen**: Gebruik de normale Docusaurus markup voor verwijzingen maar In PROMPT.md en CLAUDE_ bestanden gebruik directory paths (dit zijn files onderdeel van een AI prompt)
**Structuur**: Modulaire aanpak met specifieke prompt modules per onderwerp

## 📋 Git Conventies

- Schrijf git commit messages in het Nederlands
- Schrijf git commit messages zonder verwijzing naar AI
