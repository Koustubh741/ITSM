import time
import json
import socket
import platform
import uuid
import logging
import sys
import os
from datetime import datetime

# Third-party libraries (assumed installed)
try:
    import psutil
    import requests
except ImportError:
    print("Missing required libraries: psutil, requests. Please install them.")
    sys.exit(1)

# Configuration
API_ENDPOINT = "http://localhost:8000/api/v1/collect"
POLL_INTERVAL = 60  # seconds
API_TOKEN = os.getenv("COLLECT_API_TOKEN", "D012tQJn8MQXfggfHbNcOE-l8tFtnHAGiGMFjYPC45SCssMbZKx2zP9vcHddhkW6")


# Logging Setup
# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
LOG_FILE = os.path.join(SCRIPT_DIR, "agent.log")

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(LOG_FILE)
    ]
)
logger = logging.getLogger(__name__)

def get_system_info():
    """Collects static system information."""
    info = {}
    
    try:
        # OS Info
        info['operating_system'] = {
            "name": platform.system(),
            "version": platform.version(),
            "release": platform.release(),
            "architecture": platform.machine()
        }
        
        # Hardware Info (Basic)
        info['hostname'] = socket.gethostname()
        
        # Processor
        info['processor'] = {
            "name": platform.processor(),
            "cores": psutil.cpu_count(logical=True),
            "physical_cores": psutil.cpu_count(logical=False)
        }
        
        # Memory
        svmem = psutil.virtual_memory()
        info['ram'] = {
            "total_gb": round(svmem.total / (1024 ** 3), 2)
        }
        
        # Storage (Total of all fixed drives)
        total_storage = 0
        for part in psutil.disk_partitions():
            if 'fixed' in part.opts or 'rw' in part.opts: # Simple filter
                try:
                    usage = psutil.disk_usage(part.mountpoint)
                    total_storage += usage.total
                except PermissionError:
                    continue
        info['storage'] = {
            "total_gb": round(total_storage / (1024 ** 3), 2)
        }
        
        # Vendor/Model (using wmic if on Windows)
        if platform.system() == "Windows":
            try:
                import subprocess
                # Get Manufacturer
                cmd_vendor = "wmic computersystem get manufacturer"
                vendor = subprocess.check_output(cmd_vendor).decode().split('\n')[1].strip()
                
                # Get Model
                cmd_model = "wmic computersystem get model"
                model = subprocess.check_output(cmd_model).decode().split('\n')[1].strip()
                
                # Get Serial Number
                cmd_serial = "wmic bios get serialnumber"
                serial = subprocess.check_output(cmd_serial).decode().split('\n')[1].strip()
                
                info['vendor'] = vendor
                info['model'] = model
                info['serial_number'] = serial
            except Exception as e:
                logger.error(f"Failed to get WMI data: {e}")
                info['vendor'] = "Unknown"
                info['model'] = "Unknown"
                info['serial_number'] = str(uuid.getnode()) # Fallback
        else:
             info['vendor'] = "Generic"
             info['model'] = "Generic"
             info['serial_number'] = str(uuid.getnode())

    except Exception as e:
        logger.error(f"Error collecting system info: {e}")
    
    return info

def get_utilization():
    """Collects dynamic usage data."""
    usage = {}
    try:
        usage['cpu_percent'] = psutil.cpu_percent(interval=1)
        usage['ram_percent'] = psutil.virtual_memory().percent
        usage['disk_percent'] = psutil.disk_usage('/').percent
    except Exception as e:
        logger.error(f"Error collecting utilization: {e}")
        usage = {
            "cpu_percent": 0,
            "ram_percent": 0,
            "disk_percent": 0
        }
    return usage

def determine_condition(usage):
    """Simple logic to determine health condition."""
    if usage['cpu_percent'] > 90 or usage['ram_percent'] > 95:
        return "Critical"
    elif usage['cpu_percent'] > 75 or usage['ram_percent'] > 85:
        return "Warning"
    else:
        return "Healthy"

def main():
    logger.info("Starting Enterprise Asset Discovery Agent...")
    
    while True:
        try:
            # Collect data
            sys_info = get_system_info()
            usage_info = get_utilization()
            condition = determine_condition(usage_info)
            
            # Construct Payload matching requirements
            payload = {
                "serial_number": sys_info.get("serial_number", "UNKNOWN"),
                "hostname": sys_info.get("hostname"),
                "asset_metadata": {
                    "type": "WINDOWS_SERVER",
                    "condition": condition,
                    "last_seen": datetime.now().isoformat(),
                    "location": "Datacenter-1" # Placeholder
                },
                "hardware": {
                    "manufacturer": sys_info.get("vendor"),
                    "model": sys_info.get("model"),
                    "processor": sys_info.get("processor"),
                    "ram": sys_info.get("ram"),
                    "storage": sys_info.get("storage")
                },
                "os": sys_info.get("operating_system"),
                "usage": usage_info
            }
            
            # Send to API
            logger.info(f"Sending telemetry for {payload['hostname']}...")
            try:
                headers = {"X-API-Token": API_TOKEN}
                response = requests.post(API_ENDPOINT, json=payload, headers=headers, timeout=10)
                if response.status_code in [200, 201]:
                    logger.info("Successfully pushed data to CMDB.")
                else:
                    logger.warning(f"Failed to push data. Status: {response.status_code}, Response: {response.text}")
            except requests.exceptions.ConnectionError:
                 logger.error(f"Could not connect to Controller at {API_ENDPOINT}. Is the backend running?")

            
        except Exception as e:
            logger.error(f"Unexpected error in agent loop: {e}")
        
        # Wait
        time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    main()
