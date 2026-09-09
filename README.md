# ProfilActif

ProfilActif is a web application for job seekers and recruiters that helps them communicate and find employment opportunities.

## Prerequisites

* Git
* npm
* Node.js (18+ recommended)
* MySQL

## Launch the App

There are two ways to set up and launch the application.

### Option 1 - Setup Script

The setup script automates most of the installation process.

From the repository root, make the setup script executable, then run it and follow the instructions:

```bash
chmod +x setup.sh
./setup.sh
```

### Option 2 - Manual Setup

#### 1. Clone the repository

```bash
git clone git@github.com:aludnier/ProfilsActif-mirror.git
```

#### 2. Go to the project directory

```bash
cd ProfilsActif-mirror/profilactif
```

#### 3. Install dependencies

```bash
npm install
```

#### 4. Set up the MySQL database

First, create the database:

```sql
sudo mysql

CREATE DATABASE IF NOT EXISTS profilsactif;
```


#### 5. Install the database schema

From the `profilactif` directory, run:

```bash
mysql -u USER -p profilsactif < migration/schema.sql
```

Replace `USER` with the MySQL username you created above.

#### 6. Configure the environment

Copy the `.env.example` file to `.env`:

```bash
cp apps/api/.env.example apps/api/.env
```

Then edit `apps/api/.env` and replace the required values with your local configuration, including your MySQL username and password.

#### 7. Run the application

Start the application in development mode:

```bash
npm run dev
```

If everything works correctly, you should see output similar to:

```text
[web]   ➜  Local:   http://localhost:5173/
[web]   ➜  Network: use --host to expose

[api] API démarrée sur http://localhost:3000
[api] Base de donnée connecté avec succès
```

You can then open `http://localhost:5173/` in your browser to access the website.

## Project Structure

* **Architecture**: An explanation of the website architecture is available in [`profilactif/docs/README.md`](profilactif/docs/README.md).
* **REST API documentation**: Once the application is running, the REST API documentation is available at [`http://localhost:3000/api-docs`](http://localhost:3000/api-docs).
