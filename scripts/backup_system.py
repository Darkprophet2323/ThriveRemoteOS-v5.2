#!/usr/bin/env python3
"""
ThriveRemoteOS Content Backup & Preservation System
Automated backup before system upgrades
"""

import os
import json
import shutil
import zipfile
import datetime
from pathlib import Path
import subprocess
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ThriveBackupSystem:
    def __init__(self, base_path="/app"):
        self.base_path = Path(base_path)
        self.backup_dir = self.base_path / "backups"
        self.timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        self.backup_name = f"thrive_backup_{self.timestamp}"
        
        # Ensure backup directory exists
        self.backup_dir.mkdir(exist_ok=True)
        
    def create_system_snapshot(self):
        """Create complete system snapshot"""
        try:
            logger.info("🔄 Creating ThriveRemoteOS system snapshot...")
            
            # Create backup metadata
            metadata = {
                "backup_name": self.backup_name,
                "timestamp": self.timestamp,
                "version": "ThriveRemoteOS V5.1",
                "components": {
                    "frontend": True,
                    "backend": True,
                    "database": True,
                    "ai_portal": True,
                    "kde_theme": True,
                    "music_player": True
                },
                "file_count": 0,
                "total_size": 0
            }
            
            backup_path = self.backup_dir / self.backup_name
            backup_path.mkdir(exist_ok=True)
            
            # Backup critical directories
            critical_dirs = [
                "frontend/src",
                "frontend/public", 
                "backend",
                "waitress-job-portal",
                "virtual-pets-tool",
                "virtual-sheep-pet",
                "virtual-desktop-pets"
            ]
            
            total_files = 0
            total_size = 0
            
            for dir_name in critical_dirs:
                source_dir = self.base_path / dir_name
                if source_dir.exists():
                    dest_dir = backup_path / dir_name
                    logger.info(f"📁 Backing up {dir_name}...")
                    
                    shutil.copytree(source_dir, dest_dir, ignore=shutil.ignore_patterns(
                        'node_modules', '*.log', '__pycache__', '.git', '*.pyc'
                    ))
                    
                    # Count files and size
                    for file_path in dest_dir.rglob('*'):
                        if file_path.is_file():
                            total_files += 1
                            total_size += file_path.stat().st_size
            
            # Backup configuration files
            config_files = [
                "package.json",
                "requirements.txt", 
                "ENHANCEMENT_SUMMARY.md",
                "yarn.lock",
                ".env.example"
            ]
            
            for config_file in config_files:
                source_file = self.base_path / config_file
                if source_file.exists():
                    dest_file = backup_path / config_file
                    shutil.copy2(source_file, dest_file)
                    total_files += 1
                    total_size += source_file.stat().st_size
            
            # Update metadata
            metadata["file_count"] = total_files
            metadata["total_size"] = total_size
            metadata["size_mb"] = round(total_size / (1024 * 1024), 2)
            
            # Save metadata
            metadata_file = backup_path / "backup_metadata.json"
            with open(metadata_file, 'w') as f:
                json.dump(metadata, f, indent=2)
            
            # Create compressed archive
            archive_path = self.backup_dir / f"{self.backup_name}.zip"
            logger.info(f"📦 Creating compressed archive: {archive_path}")
            
            with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for file_path in backup_path.rglob('*'):
                    if file_path.is_file():
                        arcname = file_path.relative_to(backup_path)
                        zipf.write(file_path, arcname)
            
            # Remove temporary directory
            shutil.rmtree(backup_path)
            
            archive_size = archive_path.stat().st_size
            logger.info(f"✅ Backup completed successfully!")
            logger.info(f"📊 Files backed up: {total_files}")
            logger.info(f"📊 Original size: {metadata['size_mb']} MB")
            logger.info(f"📊 Archive size: {round(archive_size / (1024 * 1024), 2)} MB")
            logger.info(f"📦 Archive location: {archive_path}")
            
            return {
                "success": True,
                "archive_path": str(archive_path),
                "metadata": metadata,
                "archive_size_mb": round(archive_size / (1024 * 1024), 2)
            }
            
        except Exception as e:
            logger.error(f"❌ Backup failed: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def create_database_backup(self):
        """Backup database content"""
        try:
            logger.info("🗄️ Creating database backup...")
            
            # Export content via API
            import requests
            import json
            
            backup_data = {
                "timestamp": self.timestamp,
                "database_content": {}
            }
            
            # Try to backup API data
            try:
                # This would ideally connect to your backend API
                api_endpoints = [
                    "/api/content/all",
                    "/api/database/status", 
                    "/api/virtual-pets"
                ]
                
                for endpoint in api_endpoints:
                    try:
                        response = requests.get(f"http://localhost:8001{endpoint}", timeout=5)
                        if response.status_code == 200:
                            backup_data["database_content"][endpoint] = response.json()
                    except:
                        logger.warning(f"Could not backup {endpoint}")
                        
            except Exception as e:
                logger.warning(f"Database backup via API failed: {e}")
            
            # Save database backup
            db_backup_path = self.backup_dir / f"database_backup_{self.timestamp}.json"
            with open(db_backup_path, 'w') as f:
                json.dump(backup_data, f, indent=2)
            
            logger.info(f"💾 Database backup saved: {db_backup_path}")
            return str(db_backup_path)
            
        except Exception as e:
            logger.error(f"Database backup failed: {str(e)}")
            return None
    
    def list_backups(self):
        """List all available backups"""
        backups = []
        
        for backup_file in self.backup_dir.glob("thrive_backup_*.zip"):
            stat = backup_file.stat()
            backups.append({
                "name": backup_file.name,
                "path": str(backup_file),
                "size_mb": round(stat.st_size / (1024 * 1024), 2),
                "created": datetime.datetime.fromtimestamp(stat.st_ctime).strftime("%Y-%m-%d %H:%M:%S")
            })
        
        return sorted(backups, key=lambda x: x["created"], reverse=True)
    
    def restore_backup(self, backup_path):
        """Restore from backup"""
        try:
            logger.info(f"🔄 Restoring from backup: {backup_path}")
            
            backup_file = Path(backup_path)
            if not backup_file.exists():
                raise Exception("Backup file not found")
            
            # Create restore directory
            restore_dir = self.base_path / "restore_temp"
            restore_dir.mkdir(exist_ok=True)
            
            # Extract backup
            with zipfile.ZipFile(backup_file, 'r') as zipf:
                zipf.extractall(restore_dir)
            
            logger.info("✅ Backup restored to temporary directory")
            logger.info(f"📁 Restore location: {restore_dir}")
            
            return {"success": True, "restore_path": str(restore_dir)}
            
        except Exception as e:
            logger.error(f"❌ Restore failed: {str(e)}")
            return {"success": False, "error": str(e)}

def main():
    """Main backup execution"""
    print("🚀 ThriveRemoteOS Backup System")
    print("=" * 50)
    
    backup_system = ThriveBackupSystem()
    
    # Create system snapshot
    result = backup_system.create_system_snapshot()
    
    if result["success"]:
        print(f"✅ System backup completed successfully!")
        print(f"📦 Archive: {result['archive_path']}")
        print(f"📊 Size: {result['archive_size_mb']} MB")
        
        # Create database backup
        db_backup = backup_system.create_database_backup()
        if db_backup:
            print(f"💾 Database backup: {db_backup}")
        
        # List all backups
        print("\n📋 Available backups:")
        for backup in backup_system.list_backups():
            print(f"  {backup['name']} - {backup['size_mb']} MB - {backup['created']}")
            
    else:
        print(f"❌ Backup failed: {result['error']}")

if __name__ == "__main__":
    main()
