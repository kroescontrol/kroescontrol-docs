#!/bin/bash
# Pre-commit validation wrapper voor Post Keyboard Hoek
# Checkt .env variabele ENABLE_PRE_COMMIT_VALIDATION

# Probeer .env te laden
if [[ -f ".env" ]]; then
    # Source .env file maar filter alleen de variabelen die we nodig hebben
    export $(grep "^ENABLE_PRE_COMMIT_VALIDATION=" .env | xargs)
fi

# Default naar false als niet gezet
ENABLE_PRE_COMMIT_VALIDATION=${ENABLE_PRE_COMMIT_VALIDATION:-false}

# Check of validation enabled is
if [[ "$ENABLE_PRE_COMMIT_VALIDATION" == "true" ]]; then
    echo "🔍 Pre-commit validation enabled - running Post Keyboard Hoek..."
    ./post-keyboard-hoek.sh
    exit_code=$?
    
    if [[ $exit_code -eq 0 ]]; then
        echo "✅ Pre-commit validation passed"
    else
        echo "❌ Pre-commit validation failed - commit blocked"
        echo "💡 Set ENABLE_PRE_COMMIT_VALIDATION=false in .env to skip validation"
    fi
    
    exit $exit_code
else
    echo "ℹ️  Pre-commit validation disabled (ENABLE_PRE_COMMIT_VALIDATION=false)"
    echo "💡 Set ENABLE_PRE_COMMIT_VALIDATION=true in .env to enable validation"
    exit 0
fi