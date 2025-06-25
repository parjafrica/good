"""
Granada OS Database Manager
Advanced database operations and analytics for admin system
"""

import psycopg2
from psycopg2.extras import RealDictCursor
from urllib.parse import urlparse
import os
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any

class DatabaseManager:
    def __init__(self):
        self.db_config = self._parse_db_url(os.getenv('DATABASE_URL'))
    
    def _parse_db_url(self, url: str) -> Dict[str, str]:
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
    
    def execute_query(self, query: str, params=None, fetch=True):
        """Execute database query with error handling"""
        try:
            with self.get_connection() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                    cursor.execute(query, params or ())
                    if fetch:
                        return cursor.fetchall()
                    conn.commit()
                    return cursor.rowcount
        except Exception as e:
            print(f"Database error: {e}")
            raise e
    
    def get_user_analytics(self, days: int = 30) -> Dict[str, Any]:
        """Get comprehensive user analytics"""
        query = """
            WITH user_stats AS (
                SELECT 
                    COUNT(*) as total_users,
                    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '%s days' THEN 1 END) as new_users,
                    COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
                    COUNT(CASE WHEN is_banned = true THEN 1 END) as banned_users,
                    COUNT(CASE WHEN user_type = 'admin' THEN 1 END) as admin_users,
                    COUNT(CASE WHEN user_type = 'donor' THEN 1 END) as donor_users,
                    COUNT(CASE WHEN user_type = 'student' THEN 1 END) as student_users
                FROM users
            ),
            country_stats AS (
                SELECT country, COUNT(*) as user_count
                FROM users 
                WHERE country IS NOT NULL
                GROUP BY country
                ORDER BY user_count DESC
                LIMIT 10
            ),
            sector_stats AS (
                SELECT sector, COUNT(*) as user_count
                FROM users 
                WHERE sector IS NOT NULL
                GROUP BY sector
                ORDER BY user_count DESC
                LIMIT 10
            )
            SELECT 
                (SELECT row_to_json(user_stats) FROM user_stats) as user_summary,
                (SELECT json_agg(row_to_json(country_stats)) FROM country_stats) as top_countries,
                (SELECT json_agg(row_to_json(sector_stats)) FROM sector_stats) as top_sectors
        """
        
        result = self.execute_query(query, [days])[0]
        return {
            'summary': result['user_summary'],
            'countries': result['top_countries'] or [],
            'sectors': result['top_sectors'] or []
        }
    
    def get_opportunity_analytics(self, days: int = 30) -> Dict[str, Any]:
        """Get comprehensive opportunity analytics"""
        query = """
            WITH opp_stats AS (
                SELECT 
                    COUNT(*) as total_opportunities,
                    COUNT(CASE WHEN created_at >= NOW() - INTERVAL '%s days' THEN 1 END) as new_opportunities,
                    COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_opportunities,
                    COUNT(CASE WHEN is_active = true THEN 1 END) as active_opportunities,
                    COUNT(DISTINCT country) as countries_covered,
                    COUNT(DISTINCT sector) as sectors_covered,
                    COUNT(DISTINCT source_name) as unique_sources,
                    AVG(CASE WHEN amount_max > 0 THEN amount_max END) as avg_max_amount,
                    SUM(CASE WHEN amount_max > 0 THEN amount_max END) as total_funding_available
                FROM donor_opportunities
            ),
            country_breakdown AS (
                SELECT country, COUNT(*) as opportunity_count,
                       AVG(CASE WHEN amount_max > 0 THEN amount_max END) as avg_funding
                FROM donor_opportunities 
                WHERE country IS NOT NULL
                GROUP BY country
                ORDER BY opportunity_count DESC
                LIMIT 15
            ),
            sector_breakdown AS (
                SELECT sector, COUNT(*) as opportunity_count,
                       SUM(CASE WHEN amount_max > 0 THEN amount_max END) as total_funding
                FROM donor_opportunities 
                WHERE sector IS NOT NULL
                GROUP BY sector
                ORDER BY opportunity_count DESC
                LIMIT 15
            ),
            source_performance AS (
                SELECT source_name, COUNT(*) as opportunities_found,
                       COUNT(CASE WHEN is_verified = true THEN 1 END) as verified_count,
                       AVG(CASE WHEN amount_max > 0 THEN amount_max END) as avg_amount
                FROM donor_opportunities
                GROUP BY source_name
                ORDER BY opportunities_found DESC
                LIMIT 10
            )
            SELECT 
                (SELECT row_to_json(opp_stats) FROM opp_stats) as summary,
                (SELECT json_agg(row_to_json(country_breakdown)) FROM country_breakdown) as countries,
                (SELECT json_agg(row_to_json(sector_breakdown)) FROM sector_breakdown) as sectors,
                (SELECT json_agg(row_to_json(source_performance)) FROM source_performance) as sources
        """
        
        result = self.execute_query(query, [days])[0]
        return {
            'summary': result['summary'],
            'countries': result['countries'] or [],
            'sectors': result['sectors'] or [],
            'sources': result['sources'] or []
        }
    
    def get_bot_analytics(self) -> Dict[str, Any]:
        """Get comprehensive bot analytics"""
        query = """
            WITH bot_stats AS (
                SELECT 
                    COUNT(*) as total_bots,
                    COUNT(CASE WHEN status = 'active' THEN 1 END) as active_bots,
                    COUNT(CASE WHEN status = 'running' THEN 1 END) as running_bots,
                    SUM(COALESCE(opportunities_found, 0)) as total_opportunities_found,
                    AVG(COALESCE(success_rate, 0)) as avg_success_rate,
                    AVG(COALESCE(reward_points, 0)) as avg_reward_points
                FROM search_bots
            ),
            bot_performance AS (
                SELECT 
                    name, 
                    country,
                    status,
                    opportunities_found,
                    success_rate,
                    reward_points,
                    last_run,
                    CASE 
                        WHEN last_run IS NULL THEN 'Never run'
                        WHEN last_run < NOW() - INTERVAL '1 day' THEN 'Overdue'
                        WHEN last_run < NOW() - INTERVAL '6 hours' THEN 'Due soon'
                        ELSE 'Recent'
                    END as run_status
                FROM search_bots
                ORDER BY opportunities_found DESC, reward_points DESC
            ),
            country_coverage AS (
                SELECT country, COUNT(*) as bot_count,
                       SUM(COALESCE(opportunities_found, 0)) as total_found
                FROM search_bots
                WHERE country IS NOT NULL
                GROUP BY country
                ORDER BY total_found DESC
            )
            SELECT 
                (SELECT row_to_json(bot_stats) FROM bot_stats) as summary,
                (SELECT json_agg(row_to_json(bot_performance)) FROM bot_performance) as performance,
                (SELECT json_agg(row_to_json(country_coverage)) FROM country_coverage) as coverage
        """
        
        result = self.execute_query(query)[0]
        return {
            'summary': result['summary'],
            'performance': result['performance'] or [],
            'coverage': result['coverage'] or []
        }
    
    def get_system_health(self) -> Dict[str, Any]:
        """Get system health metrics"""
        queries = {
            'database_size': "SELECT pg_size_pretty(pg_database_size(current_database())) as size",
            'table_stats': """
                SELECT 
                    schemaname,
                    tablename,
                    n_tup_ins as inserts,
                    n_tup_upd as updates,
                    n_tup_del as deletes,
                    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
                FROM pg_stat_user_tables
                ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
                LIMIT 10
            """,
            'recent_activity': """
                SELECT 
                    DATE(created_at) as date,
                    action_type,
                    COUNT(*) as count
                FROM user_interactions
                WHERE created_at >= NOW() - INTERVAL '7 days'
                GROUP BY DATE(created_at), action_type
                ORDER BY date DESC, count DESC
                LIMIT 50
            """,
            'error_logs': """
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as error_count
                FROM user_interactions
                WHERE action_type LIKE '%error%' OR action_type LIKE '%fail%'
                    AND created_at >= NOW() - INTERVAL '7 days'
                GROUP BY DATE(created_at)
                ORDER BY date DESC
            """
        }
        
        health_data = {}
        for key, query in queries.items():
            try:
                health_data[key] = self.execute_query(query)
            except Exception as e:
                health_data[key] = [{'error': str(e)}]
        
        return health_data
    
    def get_financial_analytics(self) -> Dict[str, Any]:
        """Get financial and credit analytics"""
        query = """
            WITH credit_stats AS (
                SELECT 
                    SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) as total_credits_added,
                    SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) as total_credits_spent,
                    COUNT(CASE WHEN transaction_type = 'purchase' THEN 1 END) as total_purchases,
                    COUNT(CASE WHEN transaction_type = 'usage' THEN 1 END) as total_usage,
                    COUNT(CASE WHEN transaction_type = 'refund' THEN 1 END) as total_refunds,
                    AVG(CASE WHEN amount > 0 THEN amount END) as avg_purchase_amount
                FROM credit_transactions
                WHERE created_at >= NOW() - INTERVAL '30 days'
            ),
            daily_transactions AS (
                SELECT 
                    DATE(created_at) as date,
                    transaction_type,
                    SUM(amount) as total_amount,
                    COUNT(*) as transaction_count
                FROM credit_transactions
                WHERE created_at >= NOW() - INTERVAL '30 days'
                GROUP BY DATE(created_at), transaction_type
                ORDER BY date DESC
            ),
            user_credit_distribution AS (
                SELECT 
                    CASE 
                        WHEN credits >= 5000 THEN '5000+'
                        WHEN credits >= 1000 THEN '1000-4999'
                        WHEN credits >= 500 THEN '500-999'
                        WHEN credits >= 100 THEN '100-499'
                        ELSE '0-99'
                    END as credit_range,
                    COUNT(*) as user_count
                FROM users
                GROUP BY credit_range
                ORDER BY MIN(credits) DESC
            )
            SELECT 
                (SELECT row_to_json(credit_stats) FROM credit_stats) as summary,
                (SELECT json_agg(row_to_json(daily_transactions)) FROM daily_transactions) as daily_data,
                (SELECT json_agg(row_to_json(user_credit_distribution)) FROM user_credit_distribution) as distribution
        """
        
        result = self.execute_query(query)[0]
        return {
            'summary': result['summary'],
            'daily_transactions': result['daily_data'] or [],
            'credit_distribution': result['distribution'] or []
        }
    
    def cleanup_old_data(self, days: int = 90) -> Dict[str, int]:
        """Clean up old interaction logs and maintain database health"""
        cleanup_queries = {
            'old_interactions': f"""
                DELETE FROM user_interactions 
                WHERE created_at < NOW() - INTERVAL '{days} days'
                    AND action_type NOT IN ('user_registration', 'admin_action')
            """,
            'duplicate_opportunities': """
                DELETE FROM donor_opportunities a USING donor_opportunities b
                WHERE a.id > b.id 
                    AND a.content_hash = b.content_hash
                    AND a.content_hash IS NOT NULL
            """,
            'inactive_bots': """
                UPDATE search_bots 
                SET status = 'inactive'
                WHERE last_run < NOW() - INTERVAL '30 days'
                    AND status = 'active'
            """
        }
        
        results = {}
        for operation, query in cleanup_queries.items():
            try:
                rows_affected = self.execute_query(query, fetch=False)
                results[operation] = rows_affected
            except Exception as e:
                results[operation] = f"Error: {str(e)}"
        
        return results
    
    def export_data(self, table_name: str, filters: Dict[str, Any] = None) -> List[Dict]:
        """Export data from specified table with optional filters"""
        base_query = f"SELECT * FROM {table_name}"
        params = []
        
        if filters:
            conditions = []
            for key, value in filters.items():
                if isinstance(value, list):
                    placeholders = ','.join(['%s'] * len(value))
                    conditions.append(f"{key} IN ({placeholders})")
                    params.extend(value)
                else:
                    conditions.append(f"{key} = %s")
                    params.append(value)
            
            if conditions:
                base_query += f" WHERE {' AND '.join(conditions)}"
        
        base_query += " ORDER BY created_at DESC LIMIT 10000"
        
        return self.execute_query(base_query, params)

# Initialize global database manager
db_manager = DatabaseManager()