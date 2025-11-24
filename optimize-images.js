const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SOURCE_DIR = path.join(__dirname, 'ГОТОВЫЕ РАБОТЫ');
const TARGET_DIR = path.join(__dirname, 'public/completed-pools');

// Transliteration map for Cyrillic filenames
const transliterate = (text) => {
    const map = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
        'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
        'я': 'ya', ' ': '-'
    };
    return text.toLowerCase().split('').map(char => map[char] || char).join('').replace(/[^a-z0-9-]/g, '');
};

const processImages = async () => {
    const imageMap = {};

    if (!fs.existsSync(TARGET_DIR)) {
        fs.mkdirSync(TARGET_DIR, { recursive: true });
    }

    const categories = fs.readdirSync(SOURCE_DIR);

    for (const category of categories) {
        const categoryPath = path.join(SOURCE_DIR, category);
        if (fs.statSync(categoryPath).isDirectory()) {
            // Create target category directory
            const targetCategoryDir = path.join(TARGET_DIR, category.toLowerCase());
            if (!fs.existsSync(targetCategoryDir)) {
                fs.mkdirSync(targetCategoryDir, { recursive: true });
            }

            const files = fs.readdirSync(categoryPath);

            for (const file of files) {
                if (file.match(/\.(jpg|jpeg|png|webp|heic)$/i)) {
                    const sourcePath = path.join(categoryPath, file);

                    // Generate new filename
                    const nameWithoutExt = path.parse(file).name;
                    const newName = transliterate(nameWithoutExt) + '.jpg';
                    const targetPath = path.join(targetCategoryDir, newName);

                    try {
                        await sharp(sourcePath)
                            .resize(1200, 800, {
                                fit: 'inside',
                                withoutEnlargement: true
                            })
                            .jpeg({ quality: 85, mozjpeg: true })
                            .toFile(targetPath);

                        console.log(`Processed: ${category}/${file} -> ${category.toLowerCase()}/${newName}`);

                        // Add to map
                        if (!imageMap[category.toLowerCase()]) {
                            imageMap[category.toLowerCase()] = [];
                        }
                        imageMap[category.toLowerCase()].push({
                            originalName: nameWithoutExt,
                            fileName: newName,
                            path: `/completed-pools/${category.toLowerCase()}/${newName}`
                        });
                    } catch (err) {
                        console.error(`Error processing ${file}:`, err);
                    }
                }
            }
        }
    }

    // Save image map
    fs.writeFileSync(
        path.join(TARGET_DIR, 'images.json'),
        JSON.stringify(imageMap, null, 2)
    );
    console.log('Generated images.json');
};

processImages().then(() => console.log('Done!'));
