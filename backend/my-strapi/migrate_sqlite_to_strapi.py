#!/usr/bin/env python3
"""
Migration Script: SQLite → Strapi (PostgreSQL)
Reads data from the old SQLite backup and pushes it to the new Strapi instance
via the REST API.

Usage:
    python3 migrate_sqlite_to_strapi.py --url https://strapi.salvin.me --token YOUR_API_TOKEN

To generate an API token:
    1. Go to https://strapi.salvin.me/admin
    2. Settings → API Tokens → Create new API Token
    3. Name: "Migration", Token type: "Full access"
    4. Copy the token and pass it to this script
"""

import sqlite3
import json
import argparse
import requests
import os
import sys

# Path to the SQLite backup
DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data.db.backup')


def get_data_from_sqlite(db_path):
    """Extract all content data from the SQLite database."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    data = {}

    # --- Profile ---
    try:
        cursor.execute('SELECT * FROM profiles')
        rows = cursor.fetchall()
        data['profile'] = []
        for row in rows:
            data['profile'].append({
                'name': row['name'],
                'title': row['title'],
                'bio': row['bio'],
                'resumeLink': row['resume_link'],
                'avatarUrl': row['avatar_url'],
            })
    except Exception as e:
        print(f"  ⚠ No profiles table: {e}")

    # --- Skills ---
    try:
        cursor.execute('SELECT * FROM skills')
        rows = cursor.fetchall()
        data['skills'] = []
        for row in rows:
            data['skills'].append({
                'name': row['name'],
                'category': row['category'],
                'proficiency': row['proficiency'],
                'icon': row['icon'],
            })
    except Exception as e:
        print(f"  ⚠ No skills table: {e}")

    # --- Projects ---
    try:
        cursor.execute('SELECT * FROM projects')
        rows = cursor.fetchall()
        data['projects'] = []
        for row in rows:
            tech_stack = row['tech_stack']
            if tech_stack and isinstance(tech_stack, str):
                try:
                    tech_stack = json.loads(tech_stack)
                except json.JSONDecodeError:
                    tech_stack = []

            data['projects'].append({
                'title': row['title'],
                'description': row['description'],
                'techStack': tech_stack or [],
                'liveLink': row['live_link'],
                'githubLink': row['github_link'],
                'imageUrl': row['image_url'],
            })
    except Exception as e:
        print(f"  ⚠ No projects table: {e}")

    # --- Experiences ---
    try:
        cursor.execute('SELECT * FROM experiences')
        rows = cursor.fetchall()
        data['experiences'] = []
        for row in rows:
            data['experiences'].append({
                'role': row['role'],
                'company': row['company'],
                'startDate': row['start_date'],
                'endDate': row['end_date'],
                'current': bool(row['current']),
                'description': row['description'],
            })
    except Exception as e:
        print(f"  ⚠ No experiences table: {e}")

    # --- Articles ---
    try:
        cursor.execute('SELECT * FROM articles')
        rows = cursor.fetchall()
        data['articles'] = []
        for row in rows:
            tags = row['tags']
            if tags and isinstance(tags, str):
                try:
                    tags = json.loads(tags)
                except json.JSONDecodeError:
                    tags = []
            data['articles'].append({
                'title': row['title'],
                'slug': row['slug'],
                'summary': row['summary'],
                'content': row['content'],
                'tags': tags or [],
            })
    except Exception as e:
        print(f"  ⚠ No articles table: {e}")

    conn.close()
    return data


def push_to_strapi(base_url, token, endpoint, item):
    """Push a single item to a Strapi REST endpoint."""
    url = f"{base_url}/api{endpoint}"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}',
    }
    payload = {'data': item}

    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code in (200, 201):
            return True, None
        else:
            return False, f"HTTP {response.status_code}: {response.text[:200]}"
    except requests.exceptions.RequestException as e:
        return False, str(e)


def migrate(base_url, token, dry_run=False):
    """Run the full migration."""
    print(f"\n🔄 Migration: SQLite → Strapi")
    print(f"   Source: {DB_PATH}")
    print(f"   Target: {base_url}")
    print(f"   Mode:   {'DRY RUN' if dry_run else 'LIVE'}\n")

    if not os.path.exists(DB_PATH):
        print(f"❌ SQLite backup not found at: {DB_PATH}")
        sys.exit(1)

    # Extract data
    print("📖 Reading SQLite database...")
    data = get_data_from_sqlite(DB_PATH)

    # Migration mapping: (data_key, api_endpoint, label)
    migrations = [
        ('profile', '/profiles', 'Profiles'),
        ('skills', '/skills', 'Skills'),
        ('projects', '/projects', 'Projects'),
        ('experiences', '/experiences', 'Experiences'),
        ('articles', '/articles', 'Articles'),
    ]

    total_success = 0
    total_failed = 0

    for data_key, endpoint, label in migrations:
        items = data.get(data_key, [])
        if not items:
            print(f"\n⏭  {label}: No data to migrate")
            continue

        print(f"\n📦 {label}: Migrating {len(items)} records...")

        for i, item in enumerate(items, 1):
            name = item.get('title') or item.get('name') or item.get('role') or f"Record {i}"

            if dry_run:
                print(f"   [DRY] Would create: {name}")
                total_success += 1
                continue

            success, error = push_to_strapi(base_url, token, endpoint, item)
            if success:
                print(f"   ✅ Created: {name}")
                total_success += 1
            else:
                print(f"   ❌ Failed: {name} — {error}")
                total_failed += 1

    print(f"\n{'='*50}")
    print(f"✅ Successfully migrated: {total_success}")
    if total_failed:
        print(f"❌ Failed: {total_failed}")
    print(f"{'='*50}\n")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Migrate SQLite data to Strapi')
    parser.add_argument('--url', required=True, help='Strapi base URL (e.g., https://strapi.salvin.me)')
    parser.add_argument('--token', required=True, help='Strapi API Token (Full Access)')
    parser.add_argument('--dry-run', action='store_true', help='Preview without making changes')

    args = parser.parse_args()

    # Remove trailing slash
    base_url = args.url.rstrip('/')

    migrate(base_url, args.token, args.dry_run)
