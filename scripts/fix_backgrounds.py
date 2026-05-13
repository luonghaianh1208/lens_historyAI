"""
Fix character images: Remove baked-in checkered/white backgrounds 
from AI-generated PNG files that lack true alpha transparency.

Uses rembg to remove backgrounds and save as RGBA PNG.
Backs up originals to _backup_originals/ before processing.
"""
import os
import shutil
from PIL import Image
from rembg import remove

CHAR_DIR = os.path.join(os.path.dirname(__file__), '..', 'public', 'assets', 'characters')
BACKUP_DIR = os.path.join(CHAR_DIR, '_backup_originals')

# Files that need background removal (RGB mode, baked checkered/white bg)
FILES_TO_FIX = [
    'char_an_duong_vuong.png',
    'char_ba_trieu.png',
    'char_hai_ba_trung.png',
    'char_hung_vuong_i.png',
    'char_phung_hung.png',
    'char_son_tinh_thuy_tinh.png',
    'dinh-bo-linh.png',
    'le-hoan.png',
    'ly-cong-uan.png',
]

def main():
    os.makedirs(BACKUP_DIR, exist_ok=True)
    
    for filename in FILES_TO_FIX:
        filepath = os.path.join(CHAR_DIR, filename)
        if not os.path.exists(filepath):
            print(f'  SKIP: {filename} (not found)')
            continue
        
        img = Image.open(filepath)
        if img.mode == 'RGBA':
            print(f'  SKIP: {filename} (already RGBA)')
            continue
        
        # Backup original
        backup_path = os.path.join(BACKUP_DIR, filename)
        if not os.path.exists(backup_path):
            shutil.copy2(filepath, backup_path)
            print(f'  BACKUP: {filename}')
        
        # Remove background
        print(f'  PROCESSING: {filename} ({img.size})...')
        result = remove(img)
        
        # Save as RGBA PNG
        result.save(filepath, 'PNG', optimize=True)
        print(f'  DONE: {filename} -> RGBA ({result.size})')
    
    print('\nAll files processed.')

if __name__ == '__main__':
    main()
