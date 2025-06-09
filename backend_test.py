
import requests
import unittest
import json
from datetime import datetime, date

# Use the public endpoint from the frontend .env file
BACKEND_URL = "http://localhost:8001"
API = f"{BACKEND_URL}/api"

class PreclinicalResearchAPITest(unittest.TestCase):
    """Test suite for the Preclinical Research Management API"""

    def test_01_api_root(self):
        """Test the API root endpoint"""
        response = requests.get(f"{API}/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "Preclinical Research Management API v2.0")
        print("✅ API root endpoint working")

    def test_02_status_check(self):
        """Test status check endpoints"""
        # Create status check
        status_data = {"client_name": "Test Client"}
        response = requests.post(f"{API}/status", json=status_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["client_name"], "Test Client")
        
        # Get status checks
        response = requests.get(f"{API}/status")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIsInstance(data, list)
        print("✅ Status check endpoints working")

    def test_03_get_animals(self):
        """Test getting all animals"""
        response = requests.get(f"{API}/animals")
        self.assertEqual(response.status_code, 200)
        animals = response.json()
        self.assertIsInstance(animals, list)
        print(f"✅ Retrieved {len(animals)} animals")
        
        # Check if the sample animals exist
        animal_ids = [animal["animal_id"] for animal in animals]
        expected_animals = ["RAT001", "RAT002", "RAT003"]
        for expected in expected_animals:
            self.assertIn(expected, animal_ids, f"Sample animal {expected} not found")
        
        return animals

    def test_04_create_animal(self):
        """Test creating a new animal"""
        animal_data = {
            "animal_id": f"TEST-RAT-{datetime.now().strftime('%H%M%S')}",
            "species": "Rat",
            "strain": "Wistar",
            "sex": "Male",
            "weight": 250.5,
            "birth_date": date.today().isoformat()
        }
        
        response = requests.post(f"{API}/animals", json=animal_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["animal_id"], animal_data["animal_id"])
        self.assertEqual(data["species"], animal_data["species"])
        print(f"✅ Created animal {data['animal_id']}")
        
        return data

    def test_05_get_studies(self):
        """Test getting all studies"""
        response = requests.get(f"{API}/studies")
        self.assertEqual(response.status_code, 200)
        studies = response.json()
        self.assertIsInstance(studies, list)
        print(f"✅ Retrieved {len(studies)} studies")
        
        # Check if the sample study exists
        study_names = [study["name"] for study in studies]
        self.assertIn("Cardiotoxicity Study - Compound XYZ", study_names, "Sample study not found")
        
        # Find and return the sample study
        sample_study = next((s for s in studies if s["name"] == "Cardiotoxicity Study - Compound XYZ"), None)
        self.assertIsNotNone(sample_study, "Sample study not found")
        
        return studies, sample_study

    def test_06_create_study(self):
        """Test creating a new study"""
        study_data = {
            "name": f"Test Study {datetime.now().strftime('%H%M%S')}",
            "description": "A test study created by the API test",
            "principal_investigator": "Test Investigator",
            "status": "Planning",
            "start_date": date.today().isoformat(),
            "end_date": None
        }
        
        response = requests.post(f"{API}/studies", json=study_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], study_data["name"])
        self.assertEqual(data["description"], study_data["description"])
        print(f"✅ Created study {data['name']}")
        
        return data

    def test_07_get_master_procedures(self):
        """Test getting all master procedures"""
        response = requests.get(f"{API}/master-procedures")
        self.assertEqual(response.status_code, 200)
        procedures = response.json()
        self.assertIsInstance(procedures, list)
        print(f"✅ Retrieved {len(procedures)} master procedures")
        
        # Check if the sample procedures exist
        procedure_names = [proc["name"] for proc in procedures]
        expected_procedures = ["Body Weight Measurement", "Blood Collection"]
        for expected in expected_procedures:
            self.assertIn(expected, procedure_names, f"Sample procedure {expected} not found")
        
        return procedures

    def test_08_create_master_procedure(self):
        """Test creating a new master procedure"""
        procedure_data = {
            "name": f"Test Procedure {datetime.now().strftime('%H%M%S')}",
            "category": "In-life Measurement",
            "description": "A test procedure created by the API test",
            "default_cost": 25.50,
            "currency": "USD",
            "input_fields": [
                {
                    "name": "test_field",
                    "label": "Test Field",
                    "field_type": "number",
                    "is_mandatory": True,
                    "units": "mg/dL"
                }
            ]
        }
        
        response = requests.post(f"{API}/master-procedures", json=procedure_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], procedure_data["name"])
        self.assertEqual(data["category"], procedure_data["category"])
        print(f"✅ Created master procedure {data['name']}")
        
        return data

    def test_09_get_cohorts(self):
        """Test getting cohorts for a study"""
        # First get the sample study
        _, sample_study = self.test_05_get_studies()
        
        response = requests.get(f"{API}/studies/{sample_study['id']}/cohorts")
        self.assertEqual(response.status_code, 200)
        cohorts = response.json()
        self.assertIsInstance(cohorts, list)
        print(f"✅ Retrieved {len(cohorts)} cohorts for study {sample_study['name']}")
        
        # Check if the sample cohorts exist
        cohort_names = [cohort["name"] for cohort in cohorts]
        expected_cohorts = ["Control Group", "Low Dose Group"]
        for expected in expected_cohorts:
            self.assertIn(expected, cohort_names, f"Sample cohort {expected} not found")
        
        return cohorts, sample_study

    def test_10_create_cohort(self):
        """Test creating a new cohort"""
        # First get the sample study
        _, sample_study = self.test_05_get_studies()
        
        cohort_data = {
            "study_id": sample_study["id"],
            "name": f"Test Cohort {datetime.now().strftime('%H%M%S')}",
            "description": "A test cohort created by the API test",
            "criteria": "Test animals only",
            "planned_animal_count": 5
        }
        
        response = requests.post(f"{API}/cohorts", json=cohort_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], cohort_data["name"])
        self.assertEqual(data["study_id"], cohort_data["study_id"])
        print(f"✅ Created cohort {data['name']} for study {sample_study['name']}")
        
        return data, sample_study

    def test_11_assign_animal_to_cohort(self):
        """Test assigning an animal to a cohort"""
        # Create a new animal and cohort
        animal = self.test_04_create_animal()
        cohort, _ = self.test_10_create_cohort()
        
        response = requests.post(f"{API}/cohorts/{cohort['id']}/animals/{animal['id']}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["message"], "Animal assigned to cohort successfully")
        print(f"✅ Assigned animal {animal['animal_id']} to cohort {cohort['name']}")
        
        # Verify the assignment
        response = requests.get(f"{API}/cohorts/{cohort['id']}")
        self.assertEqual(response.status_code, 200)
        updated_cohort = response.json()
        self.assertIn(animal["id"], updated_cohort["animal_ids"])
        
        return animal, cohort

    def test_12_get_visits(self):
        """Test getting visits for a study"""
        # First get the sample study
        _, sample_study = self.test_05_get_studies()
        
        response = requests.get(f"{API}/studies/{sample_study['id']}/visits")
        self.assertEqual(response.status_code, 200)
        visits = response.json()
        self.assertIsInstance(visits, list)
        print(f"✅ Retrieved {len(visits)} visits for study {sample_study['name']}")
        
        # Check if the sample visits exist
        visit_names = [visit["name"] for visit in visits]
        expected_visits = ["Baseline Screening", "Day 7 Assessment"]
        for expected in expected_visits:
            self.assertIn(expected, visit_names, f"Sample visit {expected} not found")
        
        return visits, sample_study

    def test_13_create_visit(self):
        """Test creating a new visit"""
        # First get the sample study and its cohorts
        cohorts, sample_study = self.test_09_get_cohorts()
        
        visit_data = {
            "study_id": sample_study["id"],
            "name": f"Test Visit {datetime.now().strftime('%H%M%S')}",
            "label": "TV1",
            "description": "A test visit created by the API test",
            "planned_timepoint": "Day 14",
            "planned_date": (date.today().replace(day=date.today().day + 14)).isoformat(),
            "cohort_ids": [cohorts[0]["id"]]  # Use the first cohort
        }
        
        response = requests.post(f"{API}/visits", json=visit_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["name"], visit_data["name"])
        self.assertEqual(data["study_id"], visit_data["study_id"])
        print(f"✅ Created visit {data['name']} for study {sample_study['name']}")
        
        return data, sample_study, cohorts

    def test_14_update_visit_status(self):
        """Test updating a visit's status"""
        # Create a new visit
        visit, _, _ = self.test_13_create_visit()
        
        update_data = {
            "status": "In Progress"
        }
        
        response = requests.put(f"{API}/visits/{visit['id']}", json=update_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], update_data["status"])
        print(f"✅ Updated visit {visit['name']} status to {update_data['status']}")
        
        return data

    def test_15_import_procedure_to_study(self):
        """Test importing a master procedure to a study"""
        # Get the sample study and a master procedure
        _, sample_study = self.test_05_get_studies()
        procedures = self.test_07_get_master_procedures()
        
        procedure_data = {
            "master_procedure_id": procedures[0]["id"],  # Use the first procedure
            "study_specific_cost": 30.00
        }
        
        response = requests.post(f"{API}/studies/{sample_study['id']}/procedures", json=procedure_data)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["master_procedure_id"], procedure_data["master_procedure_id"])
        self.assertEqual(data["study_id"], sample_study["id"])
        print(f"✅ Imported procedure to study {sample_study['name']}")
        
        return data, sample_study

    def test_16_assign_procedure_to_visit(self):
        """Test assigning a procedure to a visit"""
        # Create a new visit and import a procedure
        visit, sample_study, _ = self.test_13_create_visit()
        study_procedure, _ = self.test_15_import_procedure_to_study()
        
        procedure_assignment = {
            "study_procedure_id": study_procedure["id"],
            "sequence_order": 1
        }
        
        response = requests.post(f"{API}/visits/{visit['id']}/procedures", json=procedure_assignment)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["visit_id"], visit["id"])
        self.assertEqual(data["study_procedure_id"], procedure_assignment["study_procedure_id"])
        print(f"✅ Assigned procedure to visit {visit['name']}")
        
        return data, visit

    def test_17_calculate_visit_cost(self):
        """Test calculating the cost of a visit"""
        # Assign a procedure to a visit
        _, visit = self.test_16_assign_procedure_to_visit()
        
        response = requests.get(f"{API}/visits/{visit['id']}/cost")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["visit_id"], visit["id"])
        self.assertIn("total_cost", data)
        self.assertIn("total_animals", data)
        print(f"✅ Calculated cost for visit {visit['name']}: ${data['total_cost']}")
        
        return data

    def test_18_calculate_study_cost(self):
        """Test calculating the cost of an entire study"""
        # Get the sample study
        _, sample_study = self.test_05_get_studies()
        
        response = requests.get(f"{API}/studies/{sample_study['id']}/cost")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["study_id"], sample_study["id"])
        self.assertIn("total_cost", data)
        self.assertIn("visit_costs", data)
        print(f"✅ Calculated cost for study {sample_study['name']}: ${data['total_cost']}")
        
        return data

def run_tests():
    """Run all tests in order"""
    test_suite = unittest.TestSuite()
    test_loader = unittest.TestLoader()
    test_loader.sortTestMethodsUsing = None  # Preserve the order of test methods
    test_suite.addTest(test_loader.loadTestsFromTestCase(PreclinicalResearchAPITest))
    
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    print("\n=== API Test Summary ===")
    print(f"Tests run: {result.testsRun}")
    print(f"Errors: {len(result.errors)}")
    print(f"Failures: {len(result.failures)}")
    
    if result.wasSuccessful():
        print("\n✅ All API tests passed successfully!")
        return 0
    else:
        print("\n❌ Some API tests failed.")
        return 1

if __name__ == "__main__":
    run_tests()
