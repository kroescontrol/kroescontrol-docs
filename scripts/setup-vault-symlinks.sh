#!/bin/bash

# Setup Vault Symlinks Script voor Docs Development
# Maakt symlinks naar VAULT content repositories voor lokale development
# Note: Internal docs worden gesynchroniseerd tijdens build via sync-internal-content.js

echo "🔗 Kroescontrol Docs - Vault Symlinks Setup"
echo "==========================================="

# Check if we're in the docs directory
if [ ! -f "package.json" ] || ! grep -q "kroescontrol-docs" package.json; then
  echo "❌ Error: Dit script moet uitgevoerd worden vanuit de docs directory"
  exit 1
fi

# Function to create symlink with checks
create_symlink() {
  local source=$1
  local target=$2
  local description=$3
  
  echo ""
  echo "📂 Setting up: $description"
  
  # Remove existing target if it exists
  if [ -e "pages/$target" ]; then
    if [ -L "pages/$target" ]; then
      echo "   🔄 Removing existing symlink: pages/$target"
      rm "pages/$target"
    else
      echo "   📁 Backing up existing directory: pages/$target → pages/$target.backup"
      mv "pages/$target" "pages/$target.backup"
    fi
  fi
  
  # Check if source exists
  if [ -d "$source" ]; then
    ln -s "$source" "pages/$target"
    echo "   ✅ Created symlink: $source → pages/$target"
    return 0
  else
    echo "   ⚠️  Source not found: $source"
    echo "       Keeping placeholder page for pages/$target"
    return 1
  fi
}

echo ""
echo "🔍 Checking for available content repositories..."

# Count available repositories
available_repos=0

# Note about internal docs
echo "ℹ️  Internal docs: Synced during build from apphub/docs-internal"

# Check vault operations
if [ -d "../../vault/docs-operation" ]; then
  echo "✅ Vault operations docs: ../../vault/docs-operation"
  available_repos=$((available_repos + 1))
else
  echo "❌ Vault operations docs: Not found"
fi

# Check vault finance
if [ -d "../../vault/docs-finance" ]; then
  echo "✅ Vault finance docs: ../../vault/docs-finance"
  available_repos=$((available_repos + 1))
else
  echo "❌ Vault finance docs: Not found"
fi

echo ""
echo "📊 Found $available_repos/2 vault content repositories"

if [ $available_repos -eq 0 ]; then
  echo ""
  echo "⚠️  No vault content repositories found!"
  echo "    Make sure you have cloned the vault repository:"
  echo "    - controlhub/vault (for operations & finance docs)"
  echo ""
  echo "📁 Expected directory structure:"
  echo "    controlhub/"
  echo "    ├── docs/           (current directory)"
  echo "    ├── apphub/         (internal docs source)"
  echo "    └── vault/"
  echo "        ├── docs-operation/"
  echo "        └── docs-finance/"
  echo ""
  echo "💡 Note: Internal docs are synced during build from apphub/docs-internal"
  exit 1
fi

echo ""
echo "🔗 Creating symlinks..."

# Create symlinks
created_symlinks=0

# Note: Internal docs are synced during build, not symlinked

# Operations docs (vault)
if create_symlink "../../vault/docs-operation" "operation" "Operations Documentation"; then
  created_symlinks=$((created_symlinks + 1))
fi

# Finance docs (vault)
if create_symlink "../../vault/docs-finance" "finance" "Finance Documentation"; then
  created_symlinks=$((created_symlinks + 1))
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo "✅ Created $created_symlinks vault symlinks"
echo "📂 Internal docs synced during build"

echo ""
echo "🚀 Next steps:"
echo "   npm run dev    # Start development server"
echo "   http://localhost:3003"
echo ""
echo "📝 You can now edit content in the source repositories:"
echo "   - Internal docs: apphub/docs-internal/ (synced during build)"
if [ -L "pages/operation" ]; then
  echo "   - Operations docs: vault/docs-operation/ (local symlink)"
fi
if [ -L "pages/finance" ]; then
  echo "   - Finance docs: vault/docs-finance/ (local symlink)"
fi
echo ""
echo "🔄 Changes will be reflected immediately in the development server!"

echo ""
echo "🗂️  To remove vault symlinks later:"
echo "    rm pages/operation pages/finance"
echo ""
echo "⚠️  Note: pages/internal is generated during build - do not edit directly!"