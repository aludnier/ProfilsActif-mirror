#!/usr/bin/env bash

set -e

# ============================================================
# ProfilActif - Development Setup Script
# ============================================================

echo "========================================="
echo "       ProfilActif - Setup"
echo "========================================="
echo

# ------------------------------------------------------------
# Configuration
# ------------------------------------------------------------

PROJECT_DIR="profilactif"
DATABASE_NAME="profilsactif"
ENV_EXAMPLE="apps/api/.env.example"
ENV_FILE="apps/api/.env"
SCHEMA_FILE="migrations/schema.sql"

# ------------------------------------------------------------
# Helper functions
# ------------------------------------------------------------

error() {
    echo
    echo "ERROR: $1"
    echo
    exit 1
}

success() {
    echo "✓ $1"
}

# ------------------------------------------------------------
# Check prerequisites
# ------------------------------------------------------------

echo "Checking prerequisites..."
echo

command -v git >/dev/null 2>&1 \
    || error "Git is not installed."

command -v node >/dev/null 2>&1 \
    || error "Node.js is not installed."

command -v npm >/dev/null 2>&1 \
    || error "npm is not installed."

command -v mysql >/dev/null 2>&1 \
    || error "MySQL client is not installed."

success "Git found: $(git --version)"
success "Node found: $(node --version)"
success "npm found: $(npm --version)"
success "MySQL found: $(mysql --version | head -n 1)"

echo

# ------------------------------------------------------------
# Check project directory
# ------------------------------------------------------------

if [ ! -d "$PROJECT_DIR" ]; then
    error "Directory '$PROJECT_DIR' was not found.

Make sure you are running this script from the repository root."
fi

cd "$PROJECT_DIR"

success "Project directory found."

# ------------------------------------------------------------
# Check required project files
# ------------------------------------------------------------

[ -f "package.json" ] \
    || error "package.json was not found."

[ -f "$SCHEMA_FILE" ] \
    || error "$SCHEMA_FILE was not found."

[ -f "$ENV_EXAMPLE" ] \
    || error "$ENV_EXAMPLE was not found."

# ------------------------------------------------------------
# Install npm dependencies
# ------------------------------------------------------------

echo
echo "========================================="
echo "Installing dependencies..."
echo "========================================="
echo

npm install

success "Dependencies installed."

# ------------------------------------------------------------
# Database configuration
# ------------------------------------------------------------

echo
echo "========================================="
echo "MySQL configuration"
echo "========================================="
echo

read -rp "MySQL username: " MYSQL_USER

if [ -z "$MYSQL_USER" ]; then
    error "MySQL username cannot be empty."
fi

read -rsp "MySQL password: " MYSQL_PASSWORD
echo

if [ -z "$MYSQL_PASSWORD" ]; then
    error "MySQL password cannot be empty."
fi

# ------------------------------------------------------------
# Test MySQL connection
# ------------------------------------------------------------

echo
echo "Testing MySQL connection..."

if ! mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "SELECT 1;" >/dev/null 2>&1; then
    read -rp "Do you want to create a new User[y/N]: " NEW_USER
    if [[ "$NEW_USER" =~ ^[Nn]$ ]]; then
        error "Could not connect to MySQL.

Please check your MySQL username and password."
        file
    fi
fi

success "MySQL connection successful."

# ------------------------------------------------------------
# Create user and database
# ------------------------------------------------------------

echo "Creating MySQL user and database..."

sudo mysql <<EOF
CREATE USER IF NOT EXISTS '$MYSQL_USER'@'localhost'
IDENTIFIED BY '$MYSQL_PASSWORD';

CREATE DATABASE IF NOT EXISTS \`$DATABASE_NAME\`;

GRANT ALL PRIVILEGES
ON \`$DATABASE_NAME\`.*
TO '$MYSQL_USER'@'localhost';

FLUSH PRIVILEGES;
EOF

success "MySQL user created."
success "Database created."
success "Privileges granted."
# ------------------------------------------------------------
# Import database schema
# ------------------------------------------------------------

echo
echo "Installing database schema..."

mysql \
    -u "$MYSQL_USER" \
    -p"$MYSQL_PASSWORD" \
    "$DATABASE_NAME" < "$SCHEMA_FILE"

success "Database schema installed."

# ------------------------------------------------------------
# Create .env
# ------------------------------------------------------------

echo
echo "========================================="
echo "Environment configuration"
echo "========================================="
echo

if [ -f "$ENV_FILE" ]; then
    echo "An existing .env file was found."

    read -rp "Do you want to overwrite it? [y/N]: " OVERWRITE_ENV

    if [[ "$OVERWRITE_ENV" =~ ^[Yy]$ ]]; then
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        sed -i "s/^DB_USER=.*/DB_USER=$MYSQL_USER/" apps/api/.env
        sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$MYSQL_PASSWORD/" apps/api/.env
        success ".env recreated from .env.example."
    else
        echo "Keeping existing .env."
    fi
else
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    sed -i "s/^DB_USER=.*/DB_USER=$MYSQL_USER/" apps/api/.env
    sed -i "s/^DB_PASSWORD=.*/DB_PASSWORD=$MYSQL_PASSWORD/" apps/api/.env
    success ".env created from .env.example."
fi

echo
echo "========================================="
echo "Setup complete!"
echo "========================================="
echo

echo "Before starting the application, make sure"
echo "that $ENV_FILE contains the correct values."
echo

echo "Then the application can be started with:"
echo
echo "    npm run dev"
echo

read -rp "Start ProfilActif now? [Y/n]: " START_APP

if [[ ! "$START_APP" =~ ^[Nn]$ ]]; then
    echo
    echo "========================================="
    echo "Starting ProfilActif..."
    echo "========================================="
    echo

    npm run dev
else
    echo
    echo "Setup finished. Run 'npm run dev' when you're ready."
fi
