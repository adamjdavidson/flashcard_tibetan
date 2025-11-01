/**
 * Admin Stats API endpoint
 * Vercel serverless function
 * Returns system statistics
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get all stats in parallel
    const [
      { count: totalCards },
      { count: totalUsers },
      { count: totalProgress },
      { data: usersData }
    ] = await Promise.all([
      supabase.from('cards').select('*', { count: 'exact', head: true }),
      supabase.from('user_roles').select('*', { count: 'exact', head: true }),
      supabase.from('card_progress').select('*', { count: 'exact', head: true }),
      supabase.from('user_roles').select('role')
    ]);

    // Count admins
    const adminCount = usersData?.filter(u => u.role === 'admin').length || 0;

    // Get cards by type
    const { data: cardsByType } = await supabase
      .from('cards')
      .select('type');

    const cardsByTypeCount = (cardsByType || []).reduce((acc, card) => {
      acc[card.type] = (acc[card.type] || 0) + 1;
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      stats: {
        totalCards: totalCards || 0,
        totalUsers: totalUsers || 0,
        adminCount,
        userCount: (totalUsers || 0) - adminCount,
        totalProgress: totalProgress || 0,
        cardsByType: cardsByTypeCount
      }
    });
  } catch (error) {
    console.error('Stats API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to fetch stats' 
    });
  }
}

