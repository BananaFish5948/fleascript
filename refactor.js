const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'src/lib/rateLimit.ts',
  'src/app/admin/page.tsx',
  'src/app/api/generate/route.ts',
  'src/app/api/users/init/route.ts',
  'src/app/api/user-status/route.ts',
  'src/app/api/toggle-premium/route.ts',
  'src/app/api/feedback/route.ts',
  'src/app/api/checkout-success-mock/route.ts',
  'src/app/api/cancel-subscription-mock/route.ts',
  'src/app/api/ad-click/route.ts'
];

filesToUpdate.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = content.replace(/import \{ createServerClient \} from '@\/lib\/supabase';?/g, "import { createAdminClient } from '@/lib/supabase/admin';");
    content = content.replace(/import \{ createServerClient \} from '\.\/supabase'/g, "import { createAdminClient } from './supabase/admin'");
    content = content.replace(/createServerClient/g, 'createAdminClient');
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Updated', file);
  } else {
    console.warn('File not found', file);
  }
});
