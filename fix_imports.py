import os
import re

dir_path = r'C:\Users\2531038\Desktop\LogisticsApplication\EasyRoute_frontend\src\pages'

files_to_fix = [
    'CustomerDashboard.jsx',
    'DriverDashboard.jsx',
    'PickupDashboard.jsx',
    'Profile.jsx'
]

for file in files_to_fix:
    path = os.path.join(dir_path, file)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find where lucide-react was incorrectly left behind
    match = re.search(r"import\s+{([^}]+)}\s+from\s+['\"]react-icons/fa['\"];([^}]+)}\s+from\s+['\"]lucide-react['\"];?", content)
    if match:
        print(f"Fixing {file}")
        
        # We know we need to just replace this whole block with a clean react-icons import
        # Let's extract all imports from react-icons/fa and add the missing ones
        react_icons_imports = [i.strip() for i in match.group(1).split(',')]
        
        icon_map = {
            'Plus': 'FaPlus',
            'Trash2': 'FaTrash',
            'MessageSquare': 'FaComment',
            'CheckCircle2': 'FaCheckCircle',
            'Play': 'FaPlay',
            'DollarSign': 'FaDollarSign',
            'Wallet': 'FaWallet',
            'ChevronRight': 'FaChevronRight',
            'ArrowUpRight': 'FaExternalLinkAlt'
        }
        
        lucide_imports_left = [i.strip() for i in match.group(2).split(',')]
        for imp in lucide_imports_left:
            if not imp: continue
            if imp in icon_map:
                react_icons_imports.append(icon_map[imp])
                content = re.sub(rf"(?<![a-zA-Z0-9_]){imp}(?![a-zA-Z0-9_])", icon_map[imp], content)
        
        react_icons_imports = list(set([i for i in react_icons_imports if i]))
        import_str = "import { " + ", ".join(react_icons_imports) + " } from 'react-icons/fa';"
        
        content = content[:match.start()] + import_str + content[match.end():]
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
            
    else:
        # fallback fix if the format is slightly different
        match2 = re.search(r"import\s+{([^}]+)}\s+from\s+['\"]react-icons/fa['\"];[\s\S]*?from\s+['\"]lucide-react['\"];?", content)
        if match2:
            print(f"Fixing with fallback {file}")
            # Just extract the react-icons import and remove the lucide one
            react_icons_imports = [i.strip() for i in match2.group(1).split(',')]
            
            icon_map = {
                'Plus': 'FaPlus',
                'Trash2': 'FaTrash',
                'MessageSquare': 'FaComment',
                'CheckCircle2': 'FaCheckCircle',
                'Play': 'FaPlay',
                'DollarSign': 'FaDollarSign',
                'Wallet': 'FaWallet',
                'ChevronRight': 'FaChevronRight',
                'ArrowUpRight': 'FaExternalLinkAlt'
            }
            
            for k, v in icon_map.items():
                content = re.sub(rf"(?<![a-zA-Z0-9_]){k}(?![a-zA-Z0-9_])", v, content)
                react_icons_imports.append(v)
            
            react_icons_imports = list(set([i for i in react_icons_imports if i]))
            import_str = "import { " + ", ".join(react_icons_imports) + " } from 'react-icons/fa';"
            
            content = content[:match2.start()] + import_str + content[match2.end():]
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
                
