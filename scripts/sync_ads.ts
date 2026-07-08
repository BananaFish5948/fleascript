import { createAdminClient } from '../src/lib/supabase/admin';
import { AFFILIATE_ADS } from '../src/lib/affiliateData';
import * as fs from 'fs';
import * as path from 'path';

// 自前で .env.local をロードする
try {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...values] = trimmed.split('=');
        if (key && values.length > 0) {
          const val = values.join('=').trim().replace(/(^['"]|['"]$)/g, '');
          process.env[key.trim()] = val;
        }
      }
    });
    console.log('.env.local loaded successfully.');
  }
} catch (e) {
  console.warn('Warning: Failed to load .env.local', e);
}

async function sync() {
  console.log('Starting sync of affiliate ads to Supabase...');
  const supabase = createAdminClient();

  // 既存データを削除
  console.log('Cleaning up existing ads...');
  const { error: deleteError } = await supabase
    .from('affiliate_ads')
    .delete()
    .neq('id', 'dummy-id-never-exists');

  if (deleteError) {
    console.error('Failed to clear existing ads:', deleteError.message);
    process.exit(1);
  }

  // 最新データを全投入
  for (const ad of AFFILIATE_ADS) {
    const dbAd = {
      id: ad.id,
      title: ad.title,
      description: ad.description,
      price_text: ad.priceText || null,
      image_url: ad.imageUrl,
      affiliate_url: ad.affiliateUrl,
      context: ad.context,
      size_target: ad.sizeTarget || null,
      updated_at: new Date().toISOString(),
    };

    console.log(`Inserting/Upserting ad: ${ad.id} (${ad.title})...`);
    const { error } = await supabase
      .from('affiliate_ads')
      .upsert(dbAd, { onConflict: 'id' });

    if (error) {
      console.error(`Failed to upsert ${ad.id}:`, error.message);
      process.exit(1);
    }
  }

  console.log('Successfully applied all affiliate ads to Supabase production database!');
}

sync().catch(err => {
  console.error('Error running sync script:', err);
  process.exit(1);
});
