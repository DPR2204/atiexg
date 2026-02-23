import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join('=').trim();
        }
    });
}

const CLOUDINARY_URL = process.env.CLOUDINARY_URL;
const url = new URL(CLOUDINARY_URL!);
cloudinary.config({
    cloud_name: url.hostname,
    api_key: url.username,
    api_secret: url.password,
    secure: true
});

async function syncAssets() {
    const TARGET_FOLDER = 'ati_exg_optz';
    console.log(`Syncing assets ONLY from asset_folder: ${TARGET_FOLDER}...`);

    try {
        const assets: any[] = [];
        let next_cursor: string | undefined = undefined;

        do {
            const result: any = await cloudinary.api.resources({
                type: 'upload',
                max_results: 500,
                next_cursor
            });

            // Filtering by asset_folder as discovered in debug
            const folderAssets = result.resources.filter((r: any) => r.asset_folder === TARGET_FOLDER);

            assets.push(...folderAssets.map((resource: any) => ({
                public_id: resource.public_id,
                display_name: resource.display_name || resource.public_id,
                width: resource.width,
                height: resource.height,
                format: resource.format,
                created_at: resource.created_at,
                url: resource.secure_url
            })));

            next_cursor = result.next_cursor;
        } while (next_cursor);

        console.log(`Successfully filtered ${assets.length} assets from ${TARGET_FOLDER}.`);

        const outputPath = path.join(__dirname, '../src/data/cloudinary-assets.json');
        const dir = path.dirname(outputPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        let existingAssets: any[] = [];
        if (fs.existsSync(outputPath)) {
            existingAssets = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
        }
        const existingIds = new Set(existingAssets.map((a: any) => a.public_id));

        const newAssets = assets.filter(a => !existingIds.has(a.public_id));
        console.log(`Found ${newAssets.length} new assets out of ${assets.length} total in Cloudinary folder.`);

        const finalAssets = existingAssets.length === 0 ? assets : [...existingAssets, ...newAssets];

        // Mezclar aleatoriamente las fotos (Fisher-Yates shuffle)
        for (let i = finalAssets.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [finalAssets[i], finalAssets[j]] = [finalAssets[j], finalAssets[i]];
        }

        fs.writeFileSync(outputPath, JSON.stringify(finalAssets, null, 2));
        console.log(`Successfully merged and shuffled. Saved ${finalAssets.length} total assets to ${outputPath}`);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

syncAssets();
