#!/bin/bash

# WhatsApp Email Notifier - Docker Setup Script
# This script helps you set up and manage the Docker environment

set -e

echo "🚀 WhatsApp Email Notifier - Docker Setup"
echo "==========================================="

# Function to check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo "❌ Docker is not installed. Please install Docker first."
        echo "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        echo "❌ Docker Compose is not installed. Please install Docker Compose first."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    echo "✅ Docker and Docker Compose are installed"
}

# Function to setup environment file
setup_env() {
    if [ ! -f .env ]; then
        if [ -f docker.env.example ]; then
            echo "📝 Creating .env file from template..."
            cp docker.env.example .env
            echo "⚠️  Please edit .env file with your actual credentials:"
            echo "   - EMAIL_HOST, EMAIL_USER, EMAIL_PASS (IMAP settings)"
            echo "   - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN (Twilio credentials)"
            echo "   - ALLOWED_NUMBERS (WhatsApp numbers allowed to use the service)"
            echo ""
            echo "   Example: nano .env"
        else
            echo "❌ docker.env.example file not found. Please create .env manually."
            exit 1
        fi
    else
        echo "✅ .env file already exists"
    fi
}

# Function to build the Docker image
build_image() {
    echo "🔨 Building Docker image..."
    docker-compose build --no-cache
    echo "✅ Docker image built successfully"
}

# Function to start the services
start_services() {
    echo "🚀 Starting WhatsApp Email Notifier..."
    docker-compose up -d
    echo "✅ Services started successfully"
    echo "📱 Your WhatsApp notifier is running on http://localhost:3000"
    echo "📋 Check status: docker-compose ps"
    echo "📊 View logs: docker-compose logs -f"
}

# Function to stop services
stop_services() {
    echo "🛑 Stopping services..."
    docker-compose down
    echo "✅ Services stopped"
}

# Function to show status
show_status() {
    echo "📊 Service Status:"
    docker-compose ps
    echo ""
    echo "📈 Recent Logs:"
    docker-compose logs --tail=20
}

# Function to show logs
show_logs() {
    echo "📋 Following logs (Press Ctrl+C to stop):"
    docker-compose logs -f
}

# Function to restart services
restart_services() {
    echo "🔄 Restarting services..."
    docker-compose restart
    echo "✅ Services restarted"
}

# Function to clean up
cleanup() {
    echo "🧹 Cleaning up Docker resources..."
    docker-compose down --volumes --rmi all
    docker system prune -f
    echo "✅ Cleanup completed"
}

# Main menu
case "$1" in
    "setup")
        check_docker
        setup_env
        build_image
        echo ""
        echo "🎉 Setup completed! Next steps:"
        echo "   1. Edit .env file with your credentials"
        echo "   2. Run: ./docker-setup.sh start"
        ;;
    "start")
        check_docker
        start_services
        ;;
    "stop")
        stop_services
        ;;
    "restart")
        restart_services
        ;;
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "build")
        check_docker
        build_image
        ;;
    "cleanup")
        cleanup
        ;;
    *)
        echo "Usage: $0 {setup|start|stop|restart|status|logs|build|cleanup}"
        echo ""
        echo "Commands:"
        echo "  setup    - Initial setup (check Docker, create .env, build image)"
        echo "  start    - Start the services"
        echo "  stop     - Stop the services"
        echo "  restart  - Restart the services"
        echo "  status   - Show service status and recent logs"
        echo "  logs     - Follow logs in real-time"
        echo "  build    - Build/rebuild the Docker image"
        echo "  cleanup  - Remove all containers, images, and volumes"
        echo ""
        echo "Quick start:"
        echo "  ./docker-setup.sh setup"
        echo "  # Edit .env file with your credentials"
        echo "  ./docker-setup.sh start"
        exit 1
        ;;
esac
