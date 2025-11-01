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
    // Try both variable names (Vercel might have either)
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing environment variables:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!serviceRoleKey,
        envKeys: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
      });
      return res.status(500).json({ 
        error: 'Supabase not configured',
        details: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Check Vercel environment variables.'
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Get all stats in parallel - check for errors individually
    const [
      cardsResult,
      userRolesResult,
      progressResult,
      rolesDataResult
    ] = await Promise.all([
      supabase.from('cards').select('*', { count: 'exact', head: true }),
      supabase.from('user_roles').select('*', { count: 'exact', head: true }),
      supabase.from('card_progress').select('*', { count: 'exact', head: true }),
      supabase.from('user_roles').select('role')
    ]);

    // Check for errors in each query and throw with details
    if (cardsResult.error) {
      console.error('Cards query error:', cardsResult.error);
      throw new Error(`Cards query: ${cardsResult.error.message} (${cardsResult.error.code || 'NO_CODE'})`);
    }
    if (userRolesResult.error) {
      console.error('User roles query error:', userRolesResult.error);
      throw new Error(`User roles query: ${userRolesResult.error.message} (${userRolesResult.error.code || 'NO_CODE'})`);
    }
    if (progressResult.error) {
      console.error('Progress query error:', progressResult.error);
      throw new Error(`Progress query: ${progressResult.error.message} (${progressResult.error.code || 'NO_CODE'})`);
    }
    if (rolesDataResult.error) {
      console.error('Roles data query error:', rolesDataResult.error);
      throw new Error(`Roles data query: ${rolesDataResult.error.message} (${rolesDataResult.error.code || 'NO_CODE'})`);
    }

    const totalCards = cardsResult.count || 0;
    const totalUsers = userRolesResult.count || 0;
    const totalProgress = progressResult.count || 0;
    const usersData = rolesDataResult.data || [];

    // Count admins
    const adminCount = usersData.filter(u => u.role === 'admin').length || 0;

    // Get cards by type
    const { data: cardsByType, error: cardsByTypeError } = await supabase
      .from('cards')
      .select('type');

    if (cardsByTypeError) {
      console.error('Cards by type query error:', cardsByTypeError);
      throw new Error(`Cards by type query: ${cardsByTypeError.message} (${cardsByTypeError.code || 'NO_CODE'})`);
    }

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
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return res.status(500).json({ 
      error: error.message || 'Failed to fetch stats',
      code: error.code || 'UNKNOWN',
      details: error.details || error.hint || 'No additional details',
      hint: error.hint
    });
  }
}

