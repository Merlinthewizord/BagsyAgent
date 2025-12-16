#!/bin/bash

# Configuration Checker for BagsyAgent
# Validates that all required config is set

echo "=================================="
echo "  BagsyAgent Configuration Check"
echo "=================================="
echo ""

if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "   Run: cp .env.example .env"
    exit 1
fi

source .env

# Check required variables
MISSING=0

check_var() {
    local var_name=$1
    local var_value=${!var_name}
    local is_required=$2

    if [ -z "$var_value" ] || [ "$var_value" = "your_"* ]; then
        if [ "$is_required" = "required" ]; then
            echo "❌ $var_name is not set or still has placeholder value"
            MISSING=1
        else
            echo "⚠️  $var_name is not set (optional)"
        fi
    else
        # Mask sensitive values
        if [[ "$var_name" =~ "KEY" ]] || [[ "$var_name" =~ "PRIVATE" ]]; then
            masked="${var_value:0:4}...${var_value: -4}"
            echo "✅ $var_name is set ($masked)"
        else
            echo "✅ $var_name is set"
        fi
    fi
}

echo "Required Variables:"
echo "-------------------"
check_var "DUNE_API_KEY" "required"
check_var "SOLANA_RPC_URL" "required"
check_var "WALLET_PRIVATE_KEY" "required"

echo ""
echo "Optional Variables:"
echo "-------------------"
check_var "BAGS_API_KEY" "optional"

echo ""
echo "Trading Configuration:"
echo "----------------------"
echo "MAX_POSITION_SIZE_SOL: $MAX_POSITION_SIZE_SOL"
echo "MAX_TOTAL_PORTFOLIO_SOL: $MAX_TOTAL_PORTFOLIO_SOL"
echo "SIGNAL_SCORE_THRESHOLD: $SIGNAL_SCORE_THRESHOLD"
echo "STOP_LOSS_PERCENTAGE: $STOP_LOSS_PERCENTAGE%"
echo "TAKE_PROFIT_PERCENTAGE: $TAKE_PROFIT_PERCENTAGE%"

echo ""
echo "Agent Configuration:"
echo "--------------------"
echo "CHECK_INTERVAL_SECONDS: $CHECK_INTERVAL_SECONDS"
echo "LOG_LEVEL: $LOG_LEVEL"

echo ""

if [ $MISSING -eq 1 ]; then
    echo "❌ Configuration is incomplete!"
    echo "   Please edit .env and set all required variables"
    exit 1
else
    echo "✅ All required configuration is set!"
    echo ""
    echo "⚠️  Remember to:"
    echo "   1. Set up Dune queries and update query IDs"
    echo "   2. Fund your wallet with SOL"
    echo "   3. Test with small amounts first"
    echo ""
    exit 0
fi
