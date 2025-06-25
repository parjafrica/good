#!/usr/bin/env python3
"""
Database Seed Loader for Granada OS Admin System
Loads comprehensive test data with realistic African NGO profiles
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.parse import urlparse
import os
import json
from datetime import datetime, timedelta
import random

class SeedDataLoader:
    def __init__(self):
        self.db_config = self._parse_db_url(os.getenv('DATABASE_URL'))
    
    def _parse_db_url(self, url: str):
        if not url:
            raise ValueError("DATABASE_URL environment variable not set")
        
        parsed = urlparse(url)
        return {
            'host': parsed.hostname,
            'port': parsed.port or 5432,
            'database': parsed.path[1:],
            'user': parsed.username,
            'password': parsed.password
        }
    
    def get_connection(self):
        return psycopg2.connect(**self.db_config)
    
    def load_users(self):
        """Load realistic user data for East African organizations"""
        users_data = [
            # Admin accounts
            {
                'email': 'admin@granada.com',
                'first_name': 'System',
                'last_name': 'Administrator', 
                'user_type': 'admin',
                'credits': 10000,
                'country': 'Global',
                'sector': 'Technology',
                'org_type': 'platform'
            },
            {
                'email': 'james.mwangi@granada.com',
                'first_name': 'James',
                'last_name': 'Mwangi',
                'user_type': 'admin', 
                'credits': 8000,
                'country': 'Kenya',
                'sector': 'Development',
                'org_type': 'platform'
            },
            # NGO Directors and Program Managers
            {
                'email': 'director@amrefhealth.org',
                'first_name': 'Sarah',
                'last_name': 'Kones',
                'user_type': 'donor',
                'credits': 5000,
                'country': 'Kenya', 
                'sector': 'Health',
                'org_type': 'large_ngo'
            },
            {
                'email': 'grants@actionaid.org',
                'first_name': 'Michael',
                'last_name': 'Ssemakula',
                'user_type': 'donor',
                'credits': 7500,
                'country': 'Uganda',
                'sector': 'Poverty Alleviation',
                'org_type': 'international_ngo'
            },
            {
                'email': 'funding@oxfam.org.tz',
                'first_name': 'Grace',
                'last_name': 'Mapunda',
                'user_type': 'donor',
                'credits': 6000,
                'country': 'Tanzania',
                'sector': 'Water & Sanitation',
                'org_type': 'international_ngo'
            },
            # University Researchers
            {
                'email': 'research@mak.ac.ug',
                'first_name': 'Dr. Agnes',
                'last_name': 'Nabukeera',
                'user_type': 'student',
                'credits': 3000,
                'country': 'Uganda',
                'sector': 'Research',
                'org_type': 'university'
            },
            {
                'email': 'grants@uon.ac.ke',
                'first_name': 'Prof. David',
                'last_name': 'Kiprotich',
                'user_type': 'student',
                'credits': 2500,
                'country': 'Kenya',
                'sector': 'Agriculture',
                'org_type': 'university'
            },
            # Small NGOs and Social Enterprises
            {
                'email': 'info@slumcodeafrica.org',
                'first_name': 'Brian',
                'last_name': 'Gitta',
                'user_type': 'donor',
                'credits': 1500,
                'country': 'Uganda',
                'sector': 'Technology',
                'org_type': 'small_ngo'
            },
            {
                'email': 'director@kirahealth.org', 
                'first_name': 'Elizabeth',
                'last_name': 'Namukwaya',
                'user_type': 'donor',
                'credits': 2200,
                'country': 'Uganda',
                'sector': 'Health',
                'org_type': 'small_ngo'
            }
        ]
        
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                for user in users_data:
                    cursor.execute("""
                        INSERT INTO users (
                            id, email, first_name, last_name, hashed_password, 
                            user_type, is_active, credits, country, sector, 
                            organization_type, full_name, is_banned
                        ) VALUES (
                            gen_random_uuid(), %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
                        ) ON CONFLICT (email) DO NOTHING
                    """, (
                        user['email'],
                        user['first_name'], 
                        user['last_name'],
                        '$2b$12$LCruCr4mRROGt3GS0KwBWOTf8eFx1K2CstOJNSFe7LzJwTz8hwdMu',  # dummy hash
                        user['user_type'],
                        True,  # is_active
                        user['credits'],
                        user['country'],
                        user['sector'],
                        user['org_type'],
                        f"{user['first_name']} {user['last_name']}",
                        False  # is_banned
                    ))
                conn.commit()
        
        print(f"✓ Loaded {len(users_data)} users")
    
    def load_interactions(self):
        """Load realistic user interaction data"""
        interaction_types = [
            ('user_login', '{"method": "email", "success": true}'),
            ('opportunity_search', '{"sector": "health", "country": "kenya"}'),
            ('proposal_generation', '{"opportunity_type": "research_grant"}'),
            ('document_upload', '{"document_type": "proposal", "size_mb": 2.5}'),
            ('credit_purchase', '{"package": "standard", "amount": 1000}'),
            ('profile_update', '{"fields_updated": ["sector", "organization"]}'),
            ('dashboard_view', '{"page": "funding_opportunities"}'),
            ('bot_interaction', '{"action": "run_search", "country": "uganda"}'),
            ('admin_user_management', '{"action": "view_users", "admin": true}'),
            ('expert_consultation', '{"topic": "grant_writing", "duration": 30}')
        ]
        
        ip_addresses = [
            '41.89.216.43',    # Kenya
            '196.43.101.54',   # Uganda
            '105.160.15.240',  # Tanzania
            '41.210.142.83',   # Rwanda
            '196.223.158.148'  # South Sudan
        ]
        
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                # Get all user IDs
                cursor.execute("SELECT id FROM users")
                user_ids = [row[0] for row in cursor.fetchall()]
                
                interactions_count = 0
                for user_id in user_ids:
                    # Generate 5-15 interactions per user
                    num_interactions = random.randint(5, 15)
                    
                    for _ in range(num_interactions):
                        action_type, action_details = random.choice(interaction_types)
                        ip_address = random.choice(ip_addresses)
                        created_at = datetime.now() - timedelta(days=random.randint(0, 30))
                        
                        cursor.execute("""
                            INSERT INTO user_interactions (
                                user_id, action_type, action_details, ip_address, created_at
                            ) VALUES (%s, %s, %s, %s, %s)
                        """, (user_id, action_type, action_details, ip_address, created_at))
                        
                        interactions_count += 1
                
                conn.commit()
        
        print(f"✓ Loaded {interactions_count} user interactions")
    
    def load_credit_transactions(self):
        """Load realistic credit transaction data"""
        transaction_types = [
            ('initial_credit', 'Initial credit allocation', lambda: random.choice([1000, 1500, 2000])),
            ('purchase', 'Credit package purchase', lambda: random.choice([500, 1000, 2500, 5000])),
            ('usage', 'Proposal generation fee', lambda: -random.randint(10, 50)),
            ('usage', 'Document processing fee', lambda: -random.randint(5, 25)),
            ('bonus', 'Referral bonus', lambda: random.choice([100, 250, 500])),
            ('admin_adjustment', 'Admin credit adjustment', lambda: random.choice([-500, 500, 1000])),
            ('refund', 'Service credit refund', lambda: random.choice([200, 500, 1000]))
        ]
        
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                # Get all user IDs
                cursor.execute("SELECT id FROM users")
                user_ids = [row[0] for row in cursor.fetchall()]
                
                transactions_count = 0
                for user_id in user_ids:
                    # Generate 3-8 transactions per user
                    num_transactions = random.randint(3, 8)
                    
                    for _ in range(num_transactions):
                        trans_type, description, amount_func = random.choice(transaction_types)
                        amount = amount_func()
                        created_at = datetime.now() - timedelta(days=random.randint(0, 30))
                        
                        cursor.execute("""
                            INSERT INTO credit_transactions (
                                user_id, amount, transaction_type, description, created_at
                            ) VALUES (%s, %s, %s, %s, %s)
                        """, (user_id, amount, trans_type, description, created_at))
                        
                        transactions_count += 1
                
                conn.commit()
        
        print(f"✓ Loaded {transactions_count} credit transactions")
    
    def load_system_settings(self):
        """Load system configuration settings"""
        settings = [
            ('theme', {'default': 'dark', 'available': ['light', 'dark', 'auto']}, 'UI theme configuration'),
            ('ai_model', {'primary': 'deepseek', 'fallback': 'openai', 'temperature': 0.7}, 'AI model configuration'),
            ('credit_rates', {'proposal_generation': 10, 'document_processing': 5, 'premium_search': 20}, 'Credit consumption rates'),
            ('site_settings', {'name': 'Granada OS', 'tagline': 'Expert-Powered Funding Platform', 'maintenance_mode': False}, 'General site configuration'),
            ('notification_settings', {'email_enabled': True, 'sms_enabled': False, 'push_enabled': True}, 'Notification preferences'),
            ('security_settings', {'max_login_attempts': 5, 'session_timeout': 3600, 'require_2fa': False}, 'Security configuration'),
            ('expert_system', {'enabled': True, 'personalization': True, 'recommendation_engine': True}, 'Expert system configuration'),
            ('bot_settings', {'max_concurrent': 5, 'rate_limit': 10, 'screenshot_quality': 'high'}, 'Bot system configuration')
        ]
        
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                for setting_key, setting_value, description in settings:
                    cursor.execute("""
                        INSERT INTO system_settings (setting_key, setting_value, description)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (setting_key) DO UPDATE SET 
                            setting_value = EXCLUDED.setting_value,
                            updated_at = NOW()
                    """, (setting_key, json.dumps(setting_value), description))
                
                conn.commit()
        
        print(f"✓ Loaded {len(settings)} system settings")
    
    def update_user_credits(self):
        """Update user credits based on transaction history"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE users SET credits = GREATEST(0, (
                        SELECT COALESCE(SUM(amount), 1000)
                        FROM credit_transactions ct 
                        WHERE ct.user_id = users.id
                    )) WHERE EXISTS (
                        SELECT 1 FROM credit_transactions ct WHERE ct.user_id = users.id
                    )
                """)
                
                updated_count = cursor.rowcount
                conn.commit()
        
        print(f"✓ Updated credits for {updated_count} users")
    
    def run_full_seed(self):
        """Run complete database seeding process"""
        print("Granada OS Database Seeding")
        print("=" * 30)
        
        try:
            self.load_users()
            self.load_interactions()
            self.load_credit_transactions()
            self.load_system_settings()
            self.update_user_credits()
            
            print("\n✅ Database seeding completed successfully!")
            print("Admin system now has comprehensive test data")
            
        except Exception as e:
            print(f"\n❌ Database seeding failed: {e}")
            raise

if __name__ == "__main__":
    loader = SeedDataLoader()
    loader.run_full_seed()