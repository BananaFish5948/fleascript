import test, { mock } from 'node:test';
import assert from 'node:assert';
import { NextRequest } from 'next/server';

// Mock target modules
import * as rateLimit from '@/lib/rateLimit';
import * as serverSupabase from '@/lib/supabase/server';

// System Under Test
import { POST } from '@/app/api/generate/route';

test('Preflight Tests for /api/generate', async (t) => {
  // Common mocks setup before tests
  t.beforeEach(() => {
    // Mock Supabase to prevent next/headers cookies() errors outside Next.js
    mock.method(serverSupabase, 'createClient', async () => ({
      auth: {
        getUser: async () => ({ data: { user: null } })
      }
    }));
  });

  t.afterEach(() => {
    mock.restoreAll();
  });

  await t.test('Rate Limiting: 3rd request from same IP/Device returns 429 error (Daily Limit Hit)', async () => {
    // Mock rate limit to reject
    mock.method(rateLimit, 'checkRateLimit', async () => ({
      allowed: false,
      remaining: 0,
      isPremium: false
    }));

    const req = new NextRequest('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({ inputText: 'test input', deviceId: 'test-device' }),
      headers: {
        'x-real-ip': '192.168.1.1'
      }
    });

    const res = await POST(req);
    
    assert.strictEqual(res.status, 429, 'Expected status 429 when rate limit is exceeded');
    
    const data = await res.json();
    assert.strictEqual(data.limitReached, true, 'Expected limitReached to be true in response');
  });

  await t.test('Payload Guardrail: raw input exceeding 500 characters is rejected before API', async () => {
    // Mock rate limit to allow
    mock.method(rateLimit, 'checkRateLimit', async () => ({
      allowed: true,
      remaining: 2,
      isPremium: false
    }));

    // Create an input exceeding 500 chars (e.g. 501 chars)
    const longText = 'a'.repeat(501);

    const req = new NextRequest('http://localhost/api/generate', {
      method: 'POST',
      body: JSON.stringify({ inputText: longText, deviceId: 'test-device' }),
    });

    const res = await POST(req);
    
    assert.strictEqual(res.status, 400, 'Expected status 400 for payload exceeding limit');
    
    const data = await res.json();
    assert.ok(data.error.includes('文字以内にしてください'), 'Expected error message regarding character limit');
  });
});
