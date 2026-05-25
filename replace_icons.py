import os
import re

dir_path = r'C:\Users\2531038\Desktop\LogisticsApplication\EasyRoute_frontend\src'

icon_map = {
  'User': 'FaUser',
  'Lock': 'FaLock',
  'HelpCircle': 'FaQuestionCircle',
  'Mail': 'FaEnvelope',
  'Phone': 'FaPhone',
  'Shield': 'FaShieldAlt',
  'ArrowRight': 'FaArrowRight',
  'Send': 'FaPaperPlane',
  'CheckCircle': 'FaCheckCircle',
  'AlertCircle': 'FaExclamationCircle',
  'Save': 'FaSave',
  'BookOpen': 'FaBookOpen',
  'Info': 'FaInfoCircle',
  'Loader2': 'FaSpinner',
  'ShieldAlert': 'FaShieldVirus',
  'MapPin': 'FaMapMarkerAlt',
  'Building2': 'FaBuilding',
  'Briefcase': 'FaBriefcase',
  'CreditCard': 'FaCreditCard',
  'Star': 'FaStar',
  'Truck': 'FaTruck',
  'Package': 'FaBox',
  'BarChart3': 'FaChartBar',
  'Edit3': 'FaEdit',
  'Eye': 'FaEye',
  'EyeOff': 'FaEyeSlash',
  'ChevronDown': 'FaChevronDown',
  'ChevronUp': 'FaChevronUp',
  'Activity': 'FaChartLine',
  'Award': 'FaAward',
  'Calendar': 'FaCalendarAlt',
  'Hash': 'FaHashtag',
  'AlertTriangle': 'FaExclamationTriangle',
  'TrendingUp': 'FaArrowUp',
  'X': 'FaTimes',
  'Check': 'FaCheck',
  'ShieldCheck': 'FaShieldAlt',
  'Navigation': 'FaLocationArrow',
  'LogOut': 'FaSignOutAlt',
  'Home': 'FaHome',
  'LayoutDashboard': 'FaColumns',
  'Calculator': 'FaCalculator',
  'Layers': 'FaLayerGroup',
  'Gauge': 'FaTachometerAlt',
  'Menu': 'FaBars',
  'Search': 'FaSearch',
  'MoreVertical': 'FaEllipsisV',
  'Filter': 'FaFilter',
  'Download': 'FaDownload',
  'Settings': 'FaCog',
  'Clock': 'FaClock',
  'FileText': 'FaFileAlt',
  'Tag': 'FaTag',
  'CircleAlert': 'FaExclamationCircle',
  'ChevronLeft': 'FaChevronLeft',
  'Edit': 'FaEdit',
  'Map': 'FaMap',
  'TrendingDown': 'FaArrowDown',
  'FileDigit': 'FaFileAlt',
  'Upload': 'FaUpload',
  'Users': 'FaUsers',
  'ListFilter': 'FaFilter',
  'CreditCard': 'FaCreditCard',
  'DollarSign': 'FaDollarSign',
  'Ban': 'FaBan',
  'Unlock': 'FaUnlock',
  'Merge': 'FaCodeBranch',
  'RefreshCw': 'FaSyncAlt',
  'ArrowUpRight': 'FaExternalLinkAlt',
  'Plus': 'FaPlus',
  'Trash2': 'FaTrash',
  'MessageSquare': 'FaComment',
  'CheckCircle2': 'FaCheckCircle',
  'Play': 'FaPlay',
  'Wallet': 'FaWallet',
  'ChevronRight': 'FaChevronRight'
}

for root, _, files in os.walk(dir_path):
    for file in files:
        if file.endswith('.jsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if 'lucide-react' in content:
                # Find the import statement
                match = re.search(r"import\s+{([^}]+)}\s+from\s+['\"]lucide-react['\"];?", content)
                if match:
                    imports = [i.strip() for i in match.group(1).split(',')]
                    
                    new_imports = []
                    new_content = content
                    for imp in imports:
                        if not imp: continue
                        if imp in icon_map:
                            new_imp = icon_map[imp]
                            new_imports.append(new_imp)
                            # Replace <Icon ... />
                            new_content = re.sub(rf"<{imp}(\s|>)", rf"<{new_imp}\1", new_content)
                            # Replace Icon prop (e.g., icon: Icon)
                            # Use negative lookahead/behind to avoid matching inside words
                            new_content = re.sub(rf"(?<![a-zA-Z0-9_]){imp}(?![a-zA-Z0-9_])", new_imp, new_content)
                        else:
                            print(f"MISSING MAPPING FOR {imp} in {file}")
                    
                    new_imports = list(set(new_imports))
                    import_str = "import { " + ", ".join(new_imports) + " } from 'react-icons/fa';"
                    new_content = new_content[:match.start()] + import_str + new_content[match.end():]
                    
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {file}")
