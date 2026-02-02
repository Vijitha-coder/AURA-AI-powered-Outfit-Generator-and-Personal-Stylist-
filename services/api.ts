const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002';

// Helper function to get auth header
export async function getAuthHeader() {
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  };
}

export async function fetchWardrobe() {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/api/wardrobe`, { headers });
  if (!res.ok) throw new Error('Failed to fetch wardrobe');
  const items = await res.json();
  
  // Transform database response to match ClothingItem type
  // Database uses 'imageurl' (lowercase) but type expects 'imageData'
  return items.map((item: any) => ({
    ...item,
    imageData: item.imageurl || item.imageData || ''
  }));
}

export async function addWardrobeItem(item: {
  imageData: string;
  mimetype: string;
  category?: string;
  color?: string;
  pattern?: string | null;
  style?: string;
  season?: string;
  description?: string;
}) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/api/wardrobe`, {
    method: 'POST',
    headers,
    body: JSON.stringify(item),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to add item');
  }
  const response = await res.json();
  
  // Transform database response to match ClothingItem type
  // Database uses 'imageurl' (lowercase) but type expects 'imageData'
  return {
    ...response,
    imageData: response.imageurl || response.imageData || ''
  };
}

export async function deleteWardrobeItem(id: string) {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/api/wardrobe/${id}`, { 
    method: 'DELETE',
    headers
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to delete item');
  }
  return res.json();
}

export async function analyzeImage(imageBase64: string, mimetype: string) {
  const res = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64, mimetype }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to analyze image');
  }
  return res.json();
}
