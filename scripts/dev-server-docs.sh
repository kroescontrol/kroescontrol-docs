#!/bin/bash

# Docs Development Server Helper Script
# Usage: ./scripts/dev-server-docs.sh [start|stop|restart|status|logs]

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"
LOG_FILE="/tmp/docs-dev.log"
PORT=3003

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Kill existing Next.js dev server
kill_server() {
    echo -e "${YELLOW}Stopping Docs dev server...${NC}"
    pkill -f "next dev.*-p $PORT" 2>/dev/null
    sleep 2
    
    # Double check if killed
    if lsof -i :$PORT >/dev/null 2>&1; then
        echo -e "${RED}Port $PORT still in use, forcing kill...${NC}"
        lsof -ti :$PORT | xargs kill -9 2>/dev/null
        sleep 1
    fi
    
    echo -e "${GREEN}Server stopped${NC}"
}

# Start the dev server
start_server() {
    cd "$PROJECT_DIR"
    
    # Check if port is already in use
    if lsof -i :$PORT >/dev/null 2>&1; then
        echo -e "${RED}Port $PORT is already in use!${NC}"
        echo "Run '$0 restart' to restart the server"
        exit 1
    fi
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Installing dependencies...${NC}"
        npm install
    fi
    
    # Sync content before starting
    if [ -f "./scripts/sync-content.sh" ]; then
        echo -e "${YELLOW}Syncing content from apphub and vault...${NC}"
        ./scripts/sync-content.sh
        echo ""
    fi
    
    echo -e "${YELLOW}Starting Docs dev server on port $PORT...${NC}"
    echo "Log file: $LOG_FILE"
    
    # Clear old log and start server
    > "$LOG_FILE"
    npm run dev > "$LOG_FILE" 2>&1 &
    
    # Wait for server to start
    echo -n "Waiting for server to start"
    for i in {1..20}; do
        if curl -s http://localhost:$PORT >/dev/null 2>&1; then
            echo -e "\n${GREEN}Server started successfully!${NC}"
            echo -e "URL: ${BLUE}http://localhost:$PORT${NC}"
            
            # Show deployment info (docs doesn't have health endpoint, so basic check)
            echo -e "Environment: development"
            echo -e "Type: Documentation (Nextra)"
            
            return 0
        fi
        echo -n "."
        sleep 1
    done
    
    echo -e "\n${RED}Server failed to start. Check logs: $LOG_FILE${NC}"
    tail -20 "$LOG_FILE"
    exit 1
}

# Show server status
show_status() {
    if lsof -i :$PORT >/dev/null 2>&1; then
        echo -e "${GREEN}Docs dev server is running on port $PORT${NC}"
        
        # Test if server responds
        echo -n "Server response: "
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT | grep -q "200\|302"; then
            echo -e "${GREEN}OK${NC}"
        else
            echo -e "${RED}Not responding${NC}"
        fi
        
        # Show URL
        echo -e "\nAccess URL: ${BLUE}http://localhost:$PORT${NC}"
        echo -e "Type: Documentation site (Nextra)"
        
    else
        echo -e "${RED}Docs dev server is not running${NC}"
    fi
}

# Show logs
show_logs() {
    if [ -f "$LOG_FILE" ]; then
        echo "Showing logs from $LOG_FILE (Ctrl+C to exit):"
        tail -f "$LOG_FILE"
    else
        echo -e "${RED}No log file found${NC}"
    fi
}

# Main script logic
case "$1" in
    start)
        start_server
        ;;
    stop)
        kill_server
        ;;
    restart)
        kill_server
        start_server
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the Docs dev server"
        echo "  stop    - Stop the Docs dev server"
        echo "  restart - Restart the Docs dev server"
        echo "  status  - Show server status"
        echo "  logs    - Show server logs (tail -f)"
        exit 1
        ;;
esac