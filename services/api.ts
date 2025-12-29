const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002';

export async function fetchWardrobe() {
  const res = await fetch(`${API_BASE}/api/wardrobe`);
  if (!res.ok) throw new Error('Failed to fetch wardrobe');
  return res.json();
}

export async function addWardrobeItem(item: {
  imageData: string;
  mimeType: string;
  category?: string;
  color?: string;
  pattern?: string | null;
  style?: string;
  season?: string;
  description?: string;
}) {
  const res = await fetch(`${API_BASE}/api/wardrobe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to add item');
  }
  return res.json();
}

export async function deleteWardrobeItem(id: string) {
  const res = await fetch(`${API_BASE}/api/wardrobe/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to delete item');
  }
  return res.json();
}

export async function analyzeImage(imageBase64: string, mimeType: string) {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimeType }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to analyze image');
  }
  return res.json();
}
