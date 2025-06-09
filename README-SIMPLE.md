# 🧬 Preclinical Research Management System

A comprehensive application for managing preclinical research studies, animals, procedures, visits, and costs. Built with FastAPI backend and React frontend.

## ⚡ Quick Start

**Just run one command:**

```bash
python run-local.py
```

That's it! The script will:

- Check if you have Python and Node.js installed
- Help you set up MongoDB (local or cloud)
- Install all dependencies automatically
- Start both frontend and backend servers
- Open the app in your browser

## 📋 What You Need

1. **Python 3.7+** - Download from [python.org](https://python.org)
2. **Node.js** - Download from [nodejs.org](https://nodejs.org)
3. **MongoDB** - Choose one option:
   - **Local MongoDB** (for offline development)
   - **MongoDB Atlas** (free cloud database, easiest option)

## 🗄️ MongoDB Setup Options

### Option 1: MongoDB Atlas (Recommended - No installation needed)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free account
3. Create a free cluster
4. Get your connection string
5. Paste it when the script asks

### Option 2: Local MongoDB

- **Windows:** Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- **macOS:** `brew install mongodb-community`
- **Linux:** Follow [official instructions](https://docs.mongodb.com/manual/installation/)

## 🚀 Running the App

1. **Clone or download this project**
2. **Open terminal in the project folder**
3. **Run:** `python run-local.py`
4. **Follow the prompts** for MongoDB setup
5. **Access the app** at http://localhost:3000

## 📱 System Features

### 🔬 Master Procedure Library

- **Create & Manage Procedures** - Build a library of reusable research procedures
- **Categorization** - Organize by Sample Collection, In-life Measurement, Terminal Procedure, Bioanalysis, Observation
- **Custom Input Fields** - Define procedure-specific data collection fields (text, numbers, dropdowns, dates, etc.)
- **Cost Management** - Set default costs and currency for each procedure
- **Hierarchical Structure** - Create parent-child procedure relationships

### 🐭 Animal Management

- **Animal Registry** - Register and track laboratory animals with unique IDs
- **Detailed Profiles** - Track species, strain, sex, birth date, weight
- **Active Status** - Manage animal availability and status
- **Study Assignment** - Assign animals to specific studies and cohorts

### 📚 Study Management

- **Study Creation** - Create comprehensive research studies
- **Timeline Management** - Set start/end dates and track progress
- **Principal Investigator** - Assign responsible researchers
- **Status Tracking** - Monitor study phases (Planning, Active, Completed, etc.)
- **Procedure Integration** - Import procedures from master library with study-specific customizations

### 👥 Cohort Management

- **Study Groups** - Create cohorts within studies for animal grouping
- **Flexible Assignment** - Assign animals to cohorts with criteria-based organization
- **Capacity Planning** - Set planned animal counts and track assignments
- **Dynamic Updates** - Add/remove animals from cohorts as needed

### 📅 Visit Management

- **Visit Scheduling** - Plan study visits with specific timepoints
- **Multi-Cohort Visits** - Assign multiple cohorts to single visits
- **Status Tracking** - Monitor visit progress (Scheduled, Upcoming, In Progress, Completed, Missed, Skipped)
- **Flexible Dating** - Plan with relative timepoints and actual date tracking
- **Procedure Assignment** - Assign specific procedures to each visit

### 💰 Cost Analysis

- **Visit Cost Calculation** - Calculate total costs per visit based on assigned procedures and animal counts
- **Study Budget Analysis** - Get comprehensive cost breakdowns for entire studies
- **Procedure Costing** - Override default costs at the study level
- **Multi-Currency Support** - Handle different currencies (default USD)
- **Cost Reports** - Detailed cost breakdowns by visit and procedure

### 📊 System Monitoring

- **Health Checks** - Monitor system and database connectivity
- **Status Tracking** - Log client connections and system usage
- **API Documentation** - Auto-generated documentation at `/docs`

## 🔧 Manual Setup (if automated script doesn't work)

### Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt

# Create .env file with your MongoDB connection
echo "MONGO_URL=mongodb://localhost:27017" > .env
echo "DB_NAME=preclinical_research" >> .env

# Start backend server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup

```bash
cd frontend
yarn install  # or npm install
REACT_APP_BACKEND_URL=http://localhost:8001 yarn start  # or npm start
```

## 🌐 API Endpoints

### Master Procedures

- `POST /api/master-procedures` - Create new master procedure
- `GET /api/master-procedures` - List all procedures (with active filter)
- `GET /api/master-procedures/{id}` - Get specific procedure
- `PUT /api/master-procedures/{id}` - Update procedure
- `DELETE /api/master-procedures/{id}` - Archive procedure

### Animals

- `POST /api/animals` - Register new animal
- `GET /api/animals` - List all active animals
- `GET /api/animals/{id}` - Get specific animal

### Studies

- `POST /api/studies` - Create new study
- `GET /api/studies` - List all studies
- `GET /api/studies/{id}` - Get specific study
- `POST /api/studies/{id}/procedures` - Import procedure to study
- `GET /api/studies/{id}/procedures` - List study procedures
- `GET /api/studies/{id}/cohorts` - List study cohorts
- `GET /api/studies/{id}/visits` - List study visits
- `GET /api/studies/{id}/cost` - Calculate total study cost

### Cohorts

- `POST /api/cohorts` - Create new cohort
- `GET /api/cohorts/{id}` - Get specific cohort
- `PUT /api/cohorts/{id}` - Update cohort
- `DELETE /api/cohorts/{id}` - Delete empty cohort
- `POST /api/cohorts/{id}/animals/{animal_id}` - Assign animal to cohort
- `DELETE /api/cohorts/{id}/animals/{animal_id}` - Remove animal from cohort

### Visits

- `POST /api/visits` - Create new visit
- `GET /api/visits/{id}` - Get specific visit
- `PUT /api/visits/{id}` - Update visit
- `POST /api/visits/{id}/procedures` - Assign procedure to visit
- `GET /api/visits/{id}/procedures` - List visit procedures
- `GET /api/visits/{id}/cost` - Calculate visit cost

## 🌐 Accessing the App

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8001
- **API Documentation:** http://localhost:8001/docs (Interactive Swagger UI)
- **Health Check:** http://localhost:8001/api/

## 🔄 Workflow Example

1. **Setup Master Procedures** - Create your procedure library
2. **Register Animals** - Add animals to the system
3. **Create Study** - Define your research study
4. **Create Cohorts** - Group animals within the study
5. **Import Procedures** - Add relevant procedures to your study
6. **Schedule Visits** - Plan study timepoints
7. **Assign Procedures to Visits** - Define what happens at each visit
8. **Track Progress** - Monitor visit status and completion
9. **Analyze Costs** - Review budget and expenses

## 🚀 Advanced Features

### Data Models

- **Hierarchical Procedures** - Support for complex procedure relationships
- **Custom Input Fields** - Flexible data collection with validation
- **Audit Trail** - Created/updated timestamps on all entities
- **Soft Deletes** - Archive rather than delete important data

### Cost Management

- **Multi-level Costing** - Default costs with study-specific overrides
- **Animal-based Calculation** - Costs calculated per animal per procedure
- **Currency Support** - Multi-currency handling
- **Budget Analysis** - Comprehensive cost reporting

### System Architecture

- **FastAPI Backend** - High-performance Python API
- **MongoDB Database** - Flexible document storage
- **Async Operations** - Non-blocking database operations
- **Auto-indexing** - Optimized database performance
- **CORS Support** - Secure cross-origin requests

## 🛠️ Troubleshooting

### "Module not found" errors

- Make sure you're using the virtual environment
- Run `pip install -r requirements.txt` in the backend directory

### "Cannot connect to MongoDB"

- Check your MongoDB connection string in backend/.env
- For local MongoDB, ensure the service is running
- For Atlas, verify network access and credentials

### "Port already in use"

- Stop existing servers on ports 3000 or 8001
- Check for other running applications

### Frontend build issues

- Delete `frontend/node_modules` and reinstall
- Ensure Node.js version compatibility
- Check for JavaScript/React errors in browser console

## 📝 Data Storage

- **Database:** MongoDB (local or Atlas)
- **Collections:** master_procedures, animals, studies, cohorts, visits, study_procedures, visit_procedures, status_checks
- **Indexes:** Automatically created for optimal performance
- **Data Persistence:** All data persists between application restarts

## 🔄 Stopping the App

Press `Ctrl+C` in the terminal where you ran the script to stop both servers.

## 💡 Pro Tips

- Use the interactive API documentation at `/docs` to test endpoints
- Monitor the health endpoint to verify system status
- Create a comprehensive procedure library before starting studies
- Use cohorts to organize animals by treatment groups
- Review cost calculations before finalizing study budgets
- Backup your MongoDB data regularly for production use

## 🔒 Security Notes

- The application runs locally by default
- CORS is configured for local development
- For production deployment, configure proper authentication and HTTPS
- Secure your MongoDB connection string

---

**Need help?** Check the API documentation at http://localhost:8001/docs or the health endpoint at http://localhost:8001/api/ to verify system status!
