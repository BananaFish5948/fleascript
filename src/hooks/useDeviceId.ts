import { useState, useEffect } from 'react';

export function useDeviceId() {
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    // クライアントサイドでのみ実行
    const storedId = localStorage.getItem('flea_device_id');
    if (storedId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDeviceId(storedId);
    } else {
      const newId = crypto.randomUUID();
      localStorage.setItem('flea_device_id', newId);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDeviceId(newId);
      
      // 初回訪問時にユーザーレコードを作成するため、APIを叩く（非同期）
      fetch('/api/users/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: newId })
      }).catch(console.error);
    }
  }, []);

  return deviceId;
}
