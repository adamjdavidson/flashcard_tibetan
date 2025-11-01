/**
 * Admin Reset Progress API endpoint
 * Vercel serverless function
 * Resets SM-2 progress for a user or all users
 */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, confirm } = req.body;

    if (!confirm) {
      return res.status(400).json({ error: 'Confirmation required' });
    }

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

    let result;

    if (userId) {
      // Reset progress for specific user
      const { error } = await supabase
        .from('card_progress')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      result = { success: true, message: `Progress reset for user ${userId}` };
    } else {
      // Reset progress for ALL users (dangerous!)
      const { error } = await supabase
        .from('card_progress')
        .delete()
        .neq('user_id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;

      result = { success: true, message: 'Progress reset for all users' };
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Reset progress API error:', error);
    return res.status(500).json({ 
      error: error.message || 'Failed to reset progress' 
    });
  }
}

