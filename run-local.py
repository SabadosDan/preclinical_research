#!/usr/bin/env python3
"""
Simple script to run the Preclinical Research Management App locally
With MongoDB support - choose local MongoDB or MongoDB Atlas
"""

import subprocess
import sys
import os
import time
import threading
import webbrowser
from pathlib import Path

def check_python():
    """Check if Python 3.7+ is available"""
    if sys.version_info < (3, 7):
        print("❌ Python 3.7 or higher is required")
        print(f"   Current version: {sys.version}")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} found")
    return True

def check_node():
    """Check if Node.js and npm/yarn are available"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js {result.stdout.strip()} found")
            
            # Check for yarn
            try:
                yarn_result = subprocess.run(['yarn', '--version'], capture_output=True, text=True)
                if yarn_result.returncode == 0:
                    print(f"✅ Yarn {yarn_result.stdout.strip()} found")
                    return 'yarn'
            except FileNotFoundError:
                pass
            
            # Check for npm
            try:
                npm_result = subprocess.run(['npm', '--version'], capture_output=True, text=True)
                if npm_result.returncode == 0:
                    print(f"✅ npm {npm_result.stdout.strip()} found")
                    return 'npm'
            except FileNotFoundError:
                pass
                
            print("❌ Node.js package manager not found")
            return None
    except FileNotFoundError:
        print("❌ Node.js not found")
        print("   Please install Node.js from https://nodejs.org/")
        return None

def check_mongodb():
    """Check if MongoDB is available locally"""
    try:
        result = subprocess.run(['mongod', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print("✅ MongoDB found locally")
            return True
    except FileNotFoundError:
        pass
    
    print("ℹ️  Local MongoDB not found")
    return False

def setup_mongodb():
    """Setup MongoDB configuration"""
    print("\n🗄️  MongoDB Setup")
    print("=" * 30)
    
    has_local_mongo = check_mongodb()
    
    if has_local_mongo:
        print("\n📋 Choose your MongoDB option:")
        print("1. Use local MongoDB (recommended for development)")
        print("2. Use MongoDB Atlas (cloud database)")
        print("3. I'll set it up myself later")
        
        choice = input("\nEnter your choice (1-3): ").strip()
    else:
        print("\n📋 Choose your MongoDB option:")
        print("1. Use MongoDB Atlas (cloud database) - Easy setup!")
        print("2. Install MongoDB locally first")
        print("3. I'll set it up myself later")
        
        choice = input("\nEnter your choice (1-3): ").strip()
    
    env_content = ""
    
    if choice == "1":
        if has_local_mongo:
            # Local MongoDB
            print("\n🚀 Using local MongoDB at mongodb://localhost:27017")
            env_content = "MONGO_URL=mongodb://localhost:27017\nDB_NAME=preclinical_research\n"
        else:
            # MongoDB Atlas
            print("\n☁️  Setting up MongoDB Atlas:")
            print("1. Go to https://cloud.mongodb.com/")
            print("2. Create a free account and cluster")
            print("3. Get your connection string")
            print("\nYour connection string should look like:")
            print("mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/")
            
            mongo_url = input("\nPaste your MongoDB connection string: ").strip()
            if mongo_url:
                env_content = f"MONGO_URL={mongo_url}\nDB_NAME=preclinical_research\n"
            else:
                print("⚠️  No connection string provided. Using default (might not work)")
                env_content = "MONGO_URL=mongodb://localhost:27017\nDB_NAME=preclinical_research\n"
    
    elif choice == "2":
        if has_local_mongo:
            # MongoDB Atlas
            print("\n☁️  Setting up MongoDB Atlas:")
            print("1. Go to https://cloud.mongodb.com/")
            print("2. Create a free account and cluster")
            print("3. Get your connection string")
            print("\nYour connection string should look like:")
            print("mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/")
            
            mongo_url = input("\nPaste your MongoDB connection string: ").strip()
            if mongo_url:
                env_content = f"MONGO_URL={mongo_url}\nDB_NAME=preclinical_research\n"
            else:
                print("⚠️  No connection string provided. Using default")
                env_content = "MONGO_URL=mongodb://localhost:27017\nDB_NAME=preclinical_research\n"
        else:
            # Install MongoDB locally
            print("\n📥 To install MongoDB locally:")
            print("• Windows: Download from https://www.mongodb.com/try/download/community")
            print("• macOS: brew install mongodb-community")
            print("• Linux: Follow instructions at https://docs.mongodb.com/manual/installation/")
            print("\nAfter installation, run this script again.")
            return None
    
    else:
        # Manual setup
        print("\n⚙️  Manual setup:")
        print("Set these environment variables or create a .env file in the backend folder:")
        print("MONGO_URL=your_mongodb_connection_string")
        print("DB_NAME=preclinical_research")
        env_content = "MONGO_URL=mongodb://localhost:27017\nDB_NAME=preclinical_research\n"
    
    # Create .env file in backend directory
    backend_dir = Path("backend")
    env_file = backend_dir / ".env"
    
    try:
        with open(env_file, "w") as f:
            f.write(env_content)
        print(f"✅ Environment file created at: {env_file}")
        return True
    except Exception as e:
        print(f"⚠️  Could not create .env file: {e}")
        print("You can manually create backend/.env with:")
        print(env_content)
        return True

def install_backend_deps():
    """Install Python backend dependencies"""
    print("\n📦 Installing backend dependencies...")
    
    backend_dir = Path("backend")
    if not backend_dir.exists():
        print("❌ Backend directory not found")
        return False
    
    # Check if virtual environment should be created
    venv_dir = backend_dir / "venv"
    if not venv_dir.exists():
        print("   Creating virtual environment...")
        result = subprocess.run([sys.executable, "-m", "venv", str(venv_dir)])
        if result.returncode != 0:
            print("❌ Failed to create virtual environment")
            return False
    
    # Determine pip executable
    if os.name == 'nt':  # Windows
        pip_exe = venv_dir / "Scripts" / "pip.exe"
        python_exe = venv_dir / "Scripts" / "python.exe"
    else:  # Unix/Linux/Mac
        pip_exe = venv_dir / "bin" / "pip"
        python_exe = venv_dir / "bin" / "python"
    
    # Install dependencies
    print("   Installing packages...")
    result = subprocess.run([
        str(pip_exe), "install", "-r", "requirements.txt"
    ], cwd=backend_dir)
    
    if result.returncode == 0:
        print("✅ Backend dependencies installed")
        return True
    else:
        print("❌ Failed to install backend dependencies")
        return False

def install_frontend_deps(package_manager):
    """Install frontend dependencies"""
    print("\n📦 Installing frontend dependencies...")
    
    frontend_dir = Path("frontend")
    if not frontend_dir.exists():
        print("❌ Frontend directory not found")
        return False
    
    # Install command based on package manager
    if package_manager == 'yarn':
        cmd = ['yarn', 'install']
    else:
        cmd = ['npm', 'install']
    
    result = subprocess.run(cmd, cwd=frontend_dir)
    
    if result.returncode == 0:
        print("✅ Frontend dependencies installed")
        return True
    else:
        print("❌ Failed to install frontend dependencies")
        return False

def run_backend():
    """Run the FastAPI backend"""
    backend_dir = Path("backend")
    venv_dir = backend_dir / "venv"
    
    if os.name == 'nt':  # Windows
        python_exe = venv_dir / "Scripts" / "python.exe"
    else:  # Unix/Linux/Mac
        python_exe = venv_dir / "bin" / "python"
    
    print("🚀 Starting backend server at http://localhost:8001")
    
    # Run the full server
    subprocess.run([
        str(python_exe), "-m", "uvicorn", 
        "server:app", 
        "--host", "0.0.0.0", 
        "--port", "8001", 
        "--reload"
    ], cwd=backend_dir)

def run_frontend(package_manager):
    """Run the React frontend"""
    frontend_dir = Path("frontend")
    
    print("🚀 Starting frontend server at http://localhost:3000")
    
    # Set environment variable for backend URL
    env = os.environ.copy()
    env['REACT_APP_BACKEND_URL'] = 'http://localhost:8001'
    
    if package_manager == 'yarn':
        cmd = ['yarn', 'start']
    else:
        cmd = ['npm', 'start']
    
    subprocess.run(cmd, cwd=frontend_dir, env=env)

def main():
    print("🧬 Preclinical Research Management App - Local Setup")
    print("=" * 55)
    
    # Check requirements
    if not check_python():
        return
    
    package_manager = check_node()
    if not package_manager:
        return
    
    # Setup MongoDB
    if not setup_mongodb():
        return
    
    # Install dependencies
    if not install_backend_deps():
        return
        
    if not install_frontend_deps(package_manager):
        return
    
    print("\n🎉 Setup complete! Starting the application...")
    print("\n📱 The app will be available at:")
    print("   Frontend: http://localhost:3000")
    print("   Backend API: http://localhost:8001")
    print("   Health Check: http://localhost:8001/health")
    print("\n🛑 Press Ctrl+C to stop both servers")
    print("=" * 55)
    
    # Start backend in a separate thread
    backend_thread = threading.Thread(target=run_backend, daemon=True)
    backend_thread.start()
    
    # Wait a moment for backend to start
    time.sleep(5)
    
    # Open browser
    try:
        webbrowser.open('http://localhost:3000')
    except:
        pass
    
    # Start frontend (this will block)
    try:
        run_frontend(package_manager)
    except KeyboardInterrupt:
        print("\n👋 Shutting down servers...")
        return

if __name__ == "__main__":
    main() 