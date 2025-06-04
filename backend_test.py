import requests
import sys
import json
from datetime import datetime

class ThriveRemoteOSTester:
    def __init__(self, base_url="https://13cc974f-5f19-45a6-8ea9-fe29767b1f98.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = {}

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"Response: {json.dumps(response_data, indent=2)[:500]}...")
                    self.test_results[name] = {
                        "status": "passed",
                        "response_code": response.status_code,
                        "data": response_data
                    }
                    return success, response_data
                except:
                    print(f"Response: {response.text[:500]}...")
                    self.test_results[name] = {
                        "status": "passed",
                        "response_code": response.status_code,
                        "data": response.text
                    }
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text[:500]}...")
                self.test_results[name] = {
                    "status": "failed",
                    "response_code": response.status_code,
                    "expected_code": expected_status,
                    "error": response.text
                }
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results[name] = {
                "status": "error",
                "error": str(e)
            }
            return False, {}

    def test_database_status(self):
        """Test database connection status"""
        return self.run_test(
            "Database Status",
            "GET",
            "api/database/status",
            200
        )

    def test_content_all(self):
        """Test retrieving all content"""
        return self.run_test(
            "Content All",
            "GET",
            "api/content/all",
            200
        )

    def test_content_jobs(self):
        """Test retrieving job content"""
        return self.run_test(
            "Content Jobs",
            "GET",
            "api/content/jobs",
            200
        )

    def test_content_ai_tools(self):
        """Test retrieving AI tools content"""
        return self.run_test(
            "Content AI Tools",
            "GET",
            "api/content/ai-tools",
            200
        )

    def test_content_waitress(self):
        """Test retrieving waitress toolkit content"""
        return self.run_test(
            "Content Waitress Toolkit",
            "GET",
            "api/content/waitress",
            200
        )

    def test_content_job_resources(self):
        """Test retrieving job resources content"""
        return self.run_test(
            "Content Job Resources",
            "GET",
            "api/content/job-resources",
            200
        )

    def test_jobs_live(self):
        """Test retrieving live jobs"""
        return self.run_test(
            "Jobs Live",
            "GET",
            "api/jobs/live",
            200
        )

    def test_jobs_refresh(self):
        """Test refreshing jobs"""
        return self.run_test(
            "Jobs Refresh",
            "POST",
            "api/jobs/refresh",
            200
        )

    def test_user_current(self):
        """Test retrieving current user info"""
        return self.run_test(
            "User Current",
            "GET",
            "api/user/current",
            200
        )

    def test_dashboard_stats(self):
        """Test retrieving dashboard stats"""
        return self.run_test(
            "Dashboard Stats",
            "GET",
            "api/dashboard/stats",
            200
        )

    def test_dashboard_live_stats(self):
        """Test retrieving live dashboard stats"""
        return self.run_test(
            "Dashboard Live Stats",
            "GET",
            "api/dashboard/live-stats",
            200
        )

    def test_relocate_data(self):
        """Test retrieving relocation data"""
        return self.run_test(
            "Relocate Data",
            "GET",
            "api/relocate/data",
            200
        )
        
    def test_relocation_arizona_peak(self):
        """Test retrieving Arizona to Peak District relocation content"""
        return self.run_test(
            "Arizona to Peak District Relocation Content",
            "GET",
            "api/content/relocation-arizona-peak",
            200
        )
        
    def test_populate_relocation_content(self):
        """Test populating the database with Arizona to Peak District relocation content"""
        return self.run_test(
            "Populate Relocation Content",
            "POST",
            "api/admin/populate-relocation-content",
            200
        )

    def test_virtual_pets(self):
        """Test retrieving virtual pets info"""
        return self.run_test(
            "Virtual Pets",
            "GET",
            "api/virtual-pets",
            200
        )
        
    def test_desktop_pets_status(self):
        """Test retrieving desktop pets status"""
        return self.run_test(
            "Desktop Pets Status",
            "GET",
            "api/desktop-pets/status",
            200
        )
        
    def test_sheep_status(self):
        """Test retrieving sheep game status"""
        return self.run_test(
            "Sheep Status",
            "GET",
            "api/sheep/status",
            200
        )
        
    def test_job_portal_waitressing(self):
        """Test retrieving waitressing job portal data"""
        return self.run_test(
            "Waitressing Job Portal",
            "GET",
            "api/job-portal/waitressing",
            200
        )

    def test_register_user(self):
        """Test user registration"""
        test_user = f"test_user_{datetime.now().strftime('%H%M%S')}"
        return self.run_test(
            "Register User",
            "POST",
            "api/auth/register",
            200,
            data={"username": test_user, "password": "TestPass123!"}
        )

    def test_login_user(self, username, password):
        """Test user login"""
        success, response = self.run_test(
            "Login User",
            "POST",
            "api/auth/login",
            200,
            data={"username": username, "password": password}
        )
        if success and 'session_token' in response:
            self.token = response['session_token']
            return True
        return False

    def run_all_tests(self):
        """Run all API tests"""
        # Test database connection
        self.test_database_status()
        
        # Test content retrieval
        self.test_content_all()
        self.test_content_jobs()
        self.test_content_ai_tools()
        self.test_content_waitress()
        self.test_content_job_resources()
        
        # Test job system
        self.test_jobs_live()
        self.test_jobs_refresh()
        
        # Test user functionality
        self.test_user_current()
        self.test_dashboard_stats()
        self.test_dashboard_live_stats()
        
        # Test relocate data integration
        self.test_relocate_data()
        self.test_relocation_arizona_peak()
        self.test_populate_relocation_content()
        
        # Test virtual pets
        success, pets_data = self.test_virtual_pets()
        if success:
            print("\n🐾 Virtual Pets Information:")
            pets = pets_data.get("pets", {})
            for pet_name, pet_info in pets.items():
                print(f"✅ {pet_name}: {pet_info.get('description')}")
                print(f"  - URL: {pet_info.get('url')}")
                print(f"  - Features: {', '.join(pet_info.get('features', []))}")
                
            # Verify that there are 3 pet systems
            total_pets = pets_data.get("total_pets", 0)
            if total_pets == 3:
                print(f"\n✅ Verified: System has {total_pets} virtual pet systems as required")
            else:
                print(f"\n❌ Error: Expected 3 pet systems, but found {total_pets}")
        
        # Test desktop pets status
        success, desktop_pets_data = self.test_desktop_pets_status()
        if success:
            print("\n🐾 Desktop Pets Information:")
            print(f"✅ Status: {desktop_pets_data.get('status', 'Unknown')}")
            
            # Check for pet types
            pet_types = desktop_pets_data.get("pet_types", [])
            print(f"  - Available Pet Types: {', '.join(pet_types)}")
            
            # Check for AI behavior features
            ai_features = desktop_pets_data.get("ai_behavior_features", [])
            print("  - AI Behavior Features:")
            for feature in ai_features:
                print(f"    * {feature}")
        
        # Test sheep game status
        success, sheep_data = self.test_sheep_status()
        if success:
            print("\n🐑 Cosmic Sheep Game Information:")
            print(f"✅ {sheep_data.get('name')}: {sheep_data.get('description')}")
            
            gameplay = sheep_data.get("gameplay", {})
            print("  - Gameplay:")
            for key, value in gameplay.items():
                print(f"    * {key}: {value}")
            
            print("  - Food Types:")
            for food in sheep_data.get("food_types", [])[:3]:  # Show first 3 food types
                print(f"    * {food.get('emoji')} {food.get('name')}: {food.get('effects')}")
            
            print("  - Achievements:")
            for achievement in sheep_data.get("achievements", [])[:3]:  # Show first 3 achievements
                print(f"    * {achievement.get('name')}: {achievement.get('requirement')}")
        
        # Test waitressing job portal
        success, job_portal_data = self.test_job_portal_waitressing()
        if success:
            print("\n🍽️ Waitressing Job Portal Information:")
            print(f"✅ {job_portal_data.get('portal_name')}: {job_portal_data.get('description')}")
            
            # Check featured categories
            categories = job_portal_data.get("featured_categories", [])
            print("  - Job Categories:")
            for category in categories:
                print(f"    * {category.get('name')}: {category.get('positions')} positions, {category.get('salary_range')}")
            
            # Check job hunting resources
            resources = job_portal_data.get("job_hunting_resources", [])
            print("  - External Resources:")
            for resource in resources:
                print(f"    * {resource.get('name')}: {resource.get('url')}")
                
            # Check statistics
            stats = job_portal_data.get("statistics", {})
            print("  - Statistics:")
            for key, value in stats.items():
                print(f"    * {key}: {value}")
        
        # Test authentication
        success, response = self.test_register_user()
        if success and 'username' in response and 'session_token' in response:
            username = response['username']
            self.token = response['session_token']
            print(f"\n✅ Successfully registered and logged in as {username}")
        
        # Print results
        print(f"\n📊 Tests passed: {self.tests_passed}/{self.tests_run}")
        return self.test_results

def main():
    # Setup
    tester = ThriveRemoteOSTester()
    
    # Run all tests
    results = tester.run_all_tests()
    
    # Save results to file
    with open('api_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n💾 Test results saved to api_test_results.json")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())