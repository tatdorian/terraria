# Terraria-like Game Project

A multiplayer Terraria-inspired game built with Python, Flask, and SQLite.

## 🛠️ Technologies Used

- **Backend**: Flask, SQLAlchemy
- **Database**: SQLite
- **Authentication**: Flask-Login
- **Frontend Server**: Python's built-in HTTP server
- **Game Engine**: Pygame

## 📋 Prerequisites

- Python 3.8+
- pip (Python package manager)

## 🚀 Installation

1. Clone the repository:
```bash
git clone https://github.com/tatdorian/terraria.git
cd terraria
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate 
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

## 🎮 Running the Project

You need to start both the backend server and frontend server:

1. **Backend Server**:
```bash
python -m src.server.app
```
The backend will run on `http://localhost:5000`

2. **Frontend Server**:
```bash
cd src/client
python -m http.server 8000
```
The frontend will be available at `http://localhost:8000`

## 🏗️ Project Structure

```
terraria/
├── requirements.txt        # Project dependencies
├── src/
│   ├── server/
│   │   ├── app.py         # Main Flask application
│   │   ├── terraria.db    # SQLite database
│   │   ├── api/
│   │   │   ├── routes.py  # API endpoints
│   │   │   └── models.py  # Database models
│   │   └── game/
│   │       ├── player.py  # Player logic
│   │       ├── world.py   # World management
│   │       └── item.py    # Item system
│   └── client/
│       └── [frontend files]
```

## 🎯 Features

- **User Authentication**: Registration and login system
- **Player Management**: Create and control players
- **Inventory System**: Item management and usage
- **World Interaction**: Player movement and world manipulation


## 🔒 API Endpoints

- `/login` - User authentication
- `/register` - New user registration
- `/logout` - User logout
- `/api/player` - Player management
- `/api/world` - World interaction
- `/api/item` - Item handling

## 🐛 Troubleshooting

- Ensure both servers are running simultaneously
- Check database connectivity if authentication fails
- Verify CORS settings if experiencing API issues

## Team

- Yassine, Dorian, Hugo, Amadou 
