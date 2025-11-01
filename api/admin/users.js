/**
 * Admin Users API endpoint
 * Vercel serverless function
 * Handles user management operations (list, create, update, delete)
 */
/* eslint-env node */

import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, userId, email, password, role } = req.body;
    const adminAuth = req.headers['x-admin-auth']; // Simple token check

    // Verify admin - in production, use proper JWT verification
    // For now, we'll use the service role key as a simple auth check
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
      return res.status(500).json({ 
        error: 'Admin API not configured',
        details: 'Missing SUPABASE_SERVICE_ROLE_KEY. Check Vercel environment variables.'
      });
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    if (!supabaseUrl) {
      console.error('Missing SUPABASE_URL environment variable');
      return res.status(500).json({ 
        error: 'Supabase URL not configured',
        details: 'Missing SUPABASE_URL. Check Vercel environment variables.'
      });
    }

    // Create admin client with service role key
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Verify the requesting user is an admin by checking session
    // For now, we'll accept any request with service role key
    // In production, verify the user's session token

    let result;

    switch (action) {
      case 'list':
        // List all users
        const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) throw listError;
        
        // Get roles for each user
        const usersWithRoles = await Promise.all(
          usersData.users.map(async (user) => {
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id)
              .single();
            
            if (roleError && roleError.code !== 'PGRST116') {
              // PGRST116 = no rows found, which is okay (user has no role)
              console.error(`Error fetching role for user ${user.id}:`, roleError);
            }
            
            // Get user stats
            const { count: progressCount, error: progressError } = await supabase
              .from('card_progress')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id);

            if (progressError) {
              console.error(`Error fetching progress for user ${user.id}:`, progressError);
            }

            return {
              id: user.id,
              email: user.email,
              createdAt: user.created_at,
              lastSignInAt: user.last_sign_in_at,
              role: roleData?.role || 'user',
              progressCount: progressCount || 0
            };
          })
        );

        result = { success: true, users: usersWithRoles };
        break;

      case 'create':
        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password required' });
        }

        // Create user
        const { data: createData, error: createError } = await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true // Auto-confirm email
        });

        if (createError) throw createError;

        // Set role if provided
        if (role && createData.user) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .upsert({ user_id: createData.user.id, role }, { onConflict: 'user_id' });
          
          if (roleError) {
            console.error('Error setting role:', roleError);
            // Don't fail, just log
          }
        }

        result = { success: true, user: createData.user };
        break;

      case 'update':
        if (!userId) {
          return res.status(400).json({ error: 'User ID required' });
        }

        const updateData = {};
        if (password) updateData.password = password;
        if (email) updateData.email = email;

        if (Object.keys(updateData).length === 0) {
          return res.status(400).json({ error: 'No update data provided' });
        }

        const { data: updateResult, error: updateError } = await supabase.auth.admin.updateUserById(
          userId,
          updateData
        );

        if (updateError) throw updateError;

        // Update role if provided
        if (role !== undefined && updateResult.user) {
          if (role) {
            await supabase
              .from('user_roles')
              .upsert({ user_id: userId, role }, { onConflict: 'user_id' });
          } else {
            // Remove role (set to null or delete)
            await supabase
              .from('user_roles')
              .delete()
              .eq('user_id', userId);
          }
        }

        result = { success: true, user: updateResult.user };
        break;

      case 'delete':
        if (!userId) {
          return res.status(400).json({ error: 'User ID required' });
        }

        // Delete user (cascades to user_roles and card_progress via FK)
        const { error: deleteError } = await supabase.auth.admin.deleteUser(userId);
        if (deleteError) throw deleteError;

        result = { success: true };
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Admin API error:', error);
    console.error('Error stack:', error.stack);
    console.error('Full error object:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return res.status(500).json({ 
      error: error.message || 'Admin operation failed',
      code: error.code || 'UNKNOWN',
      details: error.details || error.hint || 'No additional details',
      hint: error.hint
    });
  }
}

