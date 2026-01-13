"""
Service to scrape asset information from manufacturer websites
"""
import re
import requests
from bs4 import BeautifulSoup
from typing import Dict
from urllib.parse import urlparse


def extract_vendor_from_url(url: str) -> str:
    """Extract vendor name from URL"""
    try:
        parsed = urlparse(url)
        hostname = parsed.netloc.lower()
        
        if 'lenovo' in hostname:
            return 'Lenovo'
        elif 'hp' in hostname or 'hewlett' in hostname:
            return 'HP'
        elif 'dell' in hostname:
            return 'Dell'
        elif 'apple' in hostname:
            return 'Apple'
        elif 'asus' in hostname:
            return 'ASUS'
        elif 'acer' in hostname:
            return 'Acer'
        elif 'msi' in hostname:
            return 'MSI'
        elif 'samsung' in hostname:
            return 'Samsung'
        elif 'microsoft' in hostname:
            return 'Microsoft'
        
        return ''
    except:
        return ''


def scrape_lenovo_website(url: str) -> Dict:
    """Scrape Lenovo website for asset information"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        asset_data = {
            'vendor': 'Lenovo',
            'type': 'Laptop',
            'segment': 'IT Equipment',
            'status': 'Active'
        }
        
        # Find model name - try multiple selectors
        model_selectors = [
            'h1.product-title',
            '.product-name',
            'h1[class*="title"]',
            'h1[class*="name"]',
            'h1',
            'title'
        ]
        
        for selector in model_selectors:
            try:
                element = soup.select_one(selector)
                if element:
                    model_text = element.get_text(strip=True)
                    model_text = re.sub(r'\s+', ' ', model_text)
                    model_text = re.sub(r'\s*-\s*Lenovo.*$', '', model_text, flags=re.I)
                    if model_text and len(model_text) < 200 and len(model_text) > 3:
                        asset_data['model'] = model_text
                        asset_data['assetName'] = model_text
                        break
            except:
                continue
        
        # Try to find specifications
        specs = {}
        page_text = soup.get_text()
        
        # Look for specification sections
        spec_sections = soup.find_all(['div', 'section', 'table'], class_=re.compile(r'spec|specification|feature|detail', re.I))
        
        for section in spec_sections:
            section_text = section.get_text()
            
            # CPU/Processor
            cpu_patterns = [
                r'Processor[:\s]+([^,\n]{5,100})',
                r'CPU[:\s]+([^,\n]{5,100})',
                r'(Intel\s+(?:Core|Celeron|Pentium|Xeon)[^,\n]{0,80})',
                r'(AMD\s+(?:Ryzen|Athlon|A-Series)[^,\n]{0,80})',
            ]
            for pattern in cpu_patterns:
                match = re.search(pattern, section_text, re.I)
                if match and 'cpu' not in specs:
                    cpu_text = match.group(1).strip() if match.groups() else match.group(0).strip()
                    if len(cpu_text) > 5 and len(cpu_text) < 150:
                        specs['cpu'] = cpu_text
                        break
            
            # RAM/Memory
            ram_patterns = [
                r'Memory[:\s]+([^,\n]{3,50})',
                r'RAM[:\s]+([^,\n]{3,50})',
                r'(\d+\s*GB?\s*(?:DDR\d|RAM|Memory|LPDDR))',
            ]
            for pattern in ram_patterns:
                match = re.search(pattern, section_text, re.I)
                if match and 'ram' not in specs:
                    ram_text = match.group(1).strip() if match.groups() else match.group(0).strip()
                    if len(ram_text) > 2 and len(ram_text) < 100:
                        specs['ram'] = ram_text
                        break
            
            # Storage
            storage_patterns = [
                r'Storage[:\s]+([^,\n]{3,80})',
                r'Hard\s+Drive[:\s]+([^,\n]{3,80})',
                r'SSD[:\s]+([^,\n]{3,80})',
                r'(\d+\s*(?:GB|TB)\s*(?:SSD|HDD|Storage|NVMe))',
            ]
            for pattern in storage_patterns:
                match = re.search(pattern, section_text, re.I)
                if match and 'storage' not in specs:
                    storage_text = match.group(1).strip() if match.groups() else match.group(0).strip()
                    if len(storage_text) > 2 and len(storage_text) < 100:
                        specs['storage'] = storage_text
                        break
        
        # Fallback: search in full page text
        if 'cpu' not in specs:
            cpu_match = re.search(r'(Intel\s+(?:Core|Celeron|Pentium|Xeon)[^,\n]{0,80}|AMD\s+(?:Ryzen|Athlon)[^,\n]{0,80})', page_text, re.I)
            if cpu_match:
                specs['cpu'] = cpu_match.group(0).strip()
        
        if 'ram' not in specs:
            ram_match = re.search(r'(\d+\s*GB?\s*(?:DDR\d|RAM|Memory|LPDDR))', page_text, re.I)
            if ram_match:
                specs['ram'] = ram_match.group(1).strip()
        
        if 'storage' not in specs:
            storage_match = re.search(r'(\d+\s*(?:GB|TB)\s*(?:SSD|HDD|Storage|NVMe))', page_text, re.I)
            if storage_match:
                specs['storage'] = storage_match.group(1).strip()
        
        if specs:
            asset_data['specifications'] = specs
            asset_data['cpu'] = specs.get('cpu', '')
            asset_data['ram'] = specs.get('ram', '')
            asset_data['storage'] = specs.get('storage', '')
        
        return asset_data
        
    except Exception as e:
        print(f"Error scraping Lenovo website: {e}")
        import traceback
        traceback.print_exc()
        return {'vendor': 'Lenovo', 'type': 'Laptop', 'error': str(e)}


def scrape_generic_website(url: str) -> Dict:
    """Generic scraper for manufacturer websites"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=15)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        vendor = extract_vendor_from_url(url)
        
        asset_data = {
            'vendor': vendor,
            'type': 'Laptop',
            'segment': 'IT Equipment',
            'status': 'Active'
        }
        
        # Find model from title or h1
        title = soup.find('title')
        if title:
            title_text = title.get_text(strip=True)
            title_text = re.sub(r'\s+', ' ', title_text)
            title_text = re.sub(r'\s*-\s*(?:Official|Store|Shop).*$', '', title_text, flags=re.I)
            if title_text and len(title_text) < 200 and len(title_text) > 3:
                asset_data['model'] = title_text
                asset_data['assetName'] = title_text
        
        h1 = soup.find('h1')
        if h1 and 'model' not in asset_data:
            h1_text = h1.get_text(strip=True)
            if h1_text and len(h1_text) < 200 and len(h1_text) > 3:
                asset_data['model'] = h1_text
                asset_data['assetName'] = h1_text
        
        # Extract specifications from page text
        page_text = soup.get_text()
        specs = {}
        
        cpu_match = re.search(r'(Intel\s+(?:Core|Celeron|Pentium|Xeon)[^,\n]{0,100}|AMD\s+(?:Ryzen|Athlon|A-Series)[^,\n]{0,100})', page_text, re.I)
        if cpu_match:
            specs['cpu'] = cpu_match.group(0).strip()
        
        ram_match = re.search(r'(\d+\s*GB?\s*(?:DDR\d|RAM|Memory|LPDDR))', page_text, re.I)
        if ram_match:
            specs['ram'] = ram_match.group(1).strip()
        
        storage_match = re.search(r'(\d+\s*(?:GB|TB)\s*(?:SSD|HDD|Storage|NVMe))', page_text, re.I)
        if storage_match:
            specs['storage'] = storage_match.group(1).strip()
        
        if specs:
            asset_data['specifications'] = specs
            asset_data['cpu'] = specs.get('cpu', '')
            asset_data['ram'] = specs.get('ram', '')
            asset_data['storage'] = specs.get('storage', '')
        
        return asset_data
        
    except Exception as e:
        print(f"Error scraping generic website: {e}")
        import traceback
        traceback.print_exc()
        vendor = extract_vendor_from_url(url)
        return {'vendor': vendor, 'type': 'Laptop', 'error': str(e)}


def fetch_asset_from_url(url: str) -> Dict:
    """
    Fetch asset information from manufacturer website URL
    
    Args:
        url: Manufacturer website URL from QR code
        
    Returns:
        Dictionary with asset information
    """
    try:
        parsed = urlparse(url)
        hostname = parsed.netloc.lower()
        
        if 'lenovo' in hostname:
            return scrape_lenovo_website(url)
        else:
            return scrape_generic_website(url)
            
    except Exception as e:
        print(f"Error fetching asset from URL: {e}")
        import traceback
        traceback.print_exc()
        vendor = extract_vendor_from_url(url)
        return {
            'vendor': vendor,
            'type': 'Laptop',
            'segment': 'IT Equipment',
            'status': 'Active',
            'error': str(e)
        }

        