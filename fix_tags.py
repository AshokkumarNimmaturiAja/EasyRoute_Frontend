import os
import re

dir_path = r'C:\Users\2531038\Desktop\LogisticsApplication\EasyRoute_frontend\src\pages'

files_to_fix = [
    'AdminDashboard.jsx',
    'CustomerDashboard.jsx',
    'DriverDashboard.jsx',
    'PickupDashboard.jsx',
    'Profile.jsx'
]

icon_map = {
    'Plus': 'FaPlus',
    'Trash2': 'FaTrash',
    'MessageSquare': 'FaComment',
    'CheckCircle2': 'FaCheckCircle',
    'Play': 'FaPlay',
    'DollarSign': 'FaDollarSign',
    'Ban': 'FaBan',
    'Unlock': 'FaUnlock',
    'Merge': 'FaCodeBranch',
    'RefreshCw': 'FaSyncAlt',
    'ArrowUpRight': 'FaExternalLinkAlt',
    'Wallet': 'FaWallet',
    'ChevronRight': 'FaChevronRight'
}

for file in files_to_fix:
    path = os.path.join(dir_path, file)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    for k, v in icon_map.items():
        content = re.sub(rf"<{k}\b", f"<{v}", content)
        content = re.sub(rf"</{k}\b", f"</{v}", content)
        content = re.sub(rf"(?<=[\[\s,]){k}\b(?=[\]\s,;])", v, content)
        
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
        
print("Tags replaced successfully")
