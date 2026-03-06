#!/usr/bin/env python3
"""
Fix Strapi Admin Panel Visibility

This script logs into the Strapi admin panel, then deletes and recreates
all entries through the admin content-manager API, which properly sets
the created_by_id field making them visible in the admin panel.

Usage:
    python3 fix_admin_visibility.py --url https://strapi.salvin.me --email YOUR_EMAIL --password YOUR_PASSWORD
"""

import argparse
import requests
import json
import sys


def admin_login(base_url, email, password):
    """Login to Strapi admin and get JWT token."""
    url = f"{base_url}/admin/login"
    payload = {"email": email, "password": password}
    
    r = requests.post(url, json=payload)
    if r.status_code != 200:
        print(f"❌ Admin login failed: {r.status_code} {r.text[:200]}")
        sys.exit(1)
    
    data = r.json()
    token = data.get('data', {}).get('token')
    if not token:
        print(f"❌ No token in response: {json.dumps(data, indent=2)[:300]}")
        sys.exit(1)
    
    print(f"✅ Logged in as admin")
    return token


def get_public_entries(base_url, endpoint):
    """Get all entries from the public REST API."""
    url = f"{base_url}/api{endpoint}?pagination[pageSize]=100"
    r = requests.get(url)
    if r.status_code != 200:
        return []
    return r.json().get('data', [])


def delete_via_admin(base_url, admin_token, content_type_uid, document_id):
    """Delete an entry via the admin content-manager API."""
    url = f"{base_url}/content-manager/collection-types/{content_type_uid}/{document_id}"
    headers = {"Authorization": f"Bearer {admin_token}"}
    r = requests.delete(url, headers=headers)
    return r.status_code in (200, 204)


def create_via_admin(base_url, admin_token, content_type_uid, data):
    """Create an entry via the admin content-manager API."""
    url = f"{base_url}/content-manager/collection-types/{content_type_uid}"
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json",
    }
    r = requests.post(url, json=data, headers=headers)
    if r.status_code in (200, 201):
        return True, r.json()
    return False, r.text[:200]


def publish_via_admin(base_url, admin_token, content_type_uid, document_id):
    """Publish an entry via the admin content-manager API."""
    url = f"{base_url}/content-manager/collection-types/{content_type_uid}/{document_id}/actions/publish"
    headers = {
        "Authorization": f"Bearer {admin_token}",
        "Content-Type": "application/json",
    }
    r = requests.post(url, json={}, headers=headers)
    return r.status_code in (200, 201)


def fix_content_type(base_url, admin_token, api_token, endpoint, uid, name_field, fields_to_copy):
    """Delete and recreate all entries for a content type."""
    print(f"\n📦 Fixing {uid}...")
    
    # Get current entries from public API
    entries = get_public_entries(base_url, endpoint)
    if not entries:
        print(f"  ⏭  No entries to fix")
        return
    
    print(f"  Found {len(entries)} entries to fix")
    
    # Store the data
    saved_entries = []
    for entry in entries:
        item = {}
        for field in fields_to_copy:
            if field in entry:
                item[field] = entry[field]
        saved_entries.append((entry.get('documentId'), entry.get(name_field, 'Unknown'), item))
    
    # Delete all entries via admin API
    for doc_id, name, _ in saved_entries:
        success = delete_via_admin(base_url, admin_token, uid, doc_id)
        if success:
            print(f"  🗑  Deleted: {name}")
        else:
            # Try via REST API token as fallback
            headers = {"Authorization": f"Bearer {api_token}"}
            r = requests.delete(f"{base_url}/api{endpoint}/{doc_id}", headers=headers)
            if r.status_code in (200, 204):
                print(f"  🗑  Deleted (via API): {name}")
            else:
                print(f"  ❌ Failed to delete: {name}")
    
    # Recreate via admin API (this sets created_by_id properly)
    for _, name, data in saved_entries:
        success, result = create_via_admin(base_url, admin_token, uid, data)
        if success:
            # Publish the entry
            new_doc_id = result.get('data', {}).get('documentId') or result.get('documentId')
            if new_doc_id:
                publish_via_admin(base_url, admin_token, uid, new_doc_id)
            print(f"  ✅ Recreated & Published: {name}")
        else:
            print(f"  ❌ Failed to create: {name} — {result}")


def main():
    parser = argparse.ArgumentParser(description='Fix Strapi admin panel visibility')
    parser.add_argument('--url', required=True, help='Strapi base URL')
    parser.add_argument('--email', required=True, help='Admin email')
    parser.add_argument('--password', required=True, help='Admin password')
    parser.add_argument('--api-token', required=True, help='API Token for fallback deletes')
    
    args = parser.parse_args()
    base_url = args.url.rstrip('/')
    
    print("🔧 Strapi Admin Visibility Fix")
    print(f"   Target: {base_url}\n")
    
    # Login
    admin_token = admin_login(base_url, args.email, args.password)
    
    # Fix Skills
    fix_content_type(
        base_url, admin_token, args.api_token,
        '/skills', 'api::skill.skill', 'name',
        ['name', 'category', 'proficiency', 'icon']
    )
    
    # Fix Projects
    fix_content_type(
        base_url, admin_token, args.api_token,
        '/projects', 'api::project.project', 'title',
        ['title', 'description', 'techStack', 'liveLink', 'githubLink', 'imageUrl']
    )
    
    # Fix Experiences
    fix_content_type(
        base_url, admin_token, args.api_token,
        '/experiences', 'api::experience.experience', 'role',
        ['role', 'company', 'startDate', 'endDate', 'current', 'description']
    )
    
    # Fix Articles
    fix_content_type(
        base_url, admin_token, args.api_token,
        '/articles', 'api::article.article', 'title',
        ['title', 'slug', 'summary', 'content', 'tags']
    )
    
    print("\n✅ All done! Refresh your Strapi admin panel.")


if __name__ == '__main__':
    main()
