import os
import shutil
import random
from bing_image_downloader import downloader

CLASSES = [
    "Gir",
    "Sahiwal",
    "Tharparkar",
    "Rathi",
    "Ongole",
    "Kankrej",
    "Hallikar",
    "Holstein Friesian",
    "Jersey",
    "Red Sindhi",
]

# Create directories
BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, "data")
TEMP_DIR = os.path.join(BASE_DIR, "temp_downloads")

def create_dirs():
    for split in ["train", "val"]:
        for c in CLASSES:
            os.makedirs(os.path.join(DATA_DIR, split, c), exist_ok=True)

if __name__ == "__main__":
    if os.path.exists(DATA_DIR):
        print("Cleaning existing data directory...")
        shutil.rmtree(DATA_DIR)
    
    if os.path.exists(TEMP_DIR):
        shutil.rmtree(TEMP_DIR)
        
    create_dirs()
    print("Starting image download for cattle breeds...")
    
    for breed in CLASSES:
        query = f"{breed} cow breed India" if breed not in ["Holstein Friesian", "Jersey"] else f"{breed} cow"
        print(f"\n--- Downloading for {breed} ---")
        try:
            downloader.download(
                query, 
                limit=50, 
                output_dir=TEMP_DIR, 
                adult_filter_off=False, 
                force_replace=False, 
                timeout=60, 
                verbose=False
            )
            
            # The images are downloaded to TEMP_DIR / query
            downloaded_folder = os.path.join(TEMP_DIR, query)
            if os.path.exists(downloaded_folder):
                images = [f for f in os.listdir(downloaded_folder) if f.lower().endswith(('.jpg', '.jpeg', '.png'))]
                random.shuffle(images)
                
                train_target = int(len(images) * 0.8)
                train_imgs = images[:train_target]
                val_imgs = images[train_target:]
                
                # Move to train
                for img in train_imgs:
                    shutil.move(
                        os.path.join(downloaded_folder, img),
                        os.path.join(DATA_DIR, "train", breed, img)
                    )
                # Move to val
                for img in val_imgs:
                    shutil.move(
                        os.path.join(downloaded_folder, img),
                        os.path.join(DATA_DIR, "val", breed, img)
                    )
                print(f"✅ {breed}: {len(train_imgs)} train, {len(val_imgs)} val")
            else:
                print(f"❌ Failed to download {breed}")
        except Exception as e:
            print(f"Error downloading {breed}: {e}")
            
    if os.path.exists(TEMP_DIR):
        shutil.rmtree(TEMP_DIR)
        
    print("\nDataset generation complete!")
