/**
 * 🗄️ Supabase Client Service
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials not configured. Using mock mode.');
}

export const supabase = supabaseUrl && supabaseKey 
    ? createClient(supabaseUrl, supabaseKey)
    : null;

/**
 * Check if Supabase is configured
 */
export const isSupabaseConfigured = () => !!supabase;

/**
 * Get all records from a table
 */
export async function getAll(table, options = {}) {
    if (!supabase) return { data: [], error: null };
    
    let query = supabase.from(table).select(options.select || '*');
    
    if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
            query = query.eq(key, value);
        });
    }
    
    if (options.order) {
        query = query.order(options.order.column, { ascending: options.order.ascending ?? false });
    }
    
    if (options.limit) {
        query = query.limit(options.limit);
    }
    
    return query;
}

/**
 * Get single record by ID
 */
export async function getById(table, id) {
    if (!supabase) return { data: null, error: null };
    return supabase.from(table).select('*').eq('id', id).single();
}

/**
 * Insert new record
 */
export async function insert(table, data) {
    if (!supabase) return { data: null, error: null };
    return supabase.from(table).insert(data).select().single();
}

/**
 * Update record
 */
export async function update(table, id, data) {
    if (!supabase) return { data: null, error: null };
    return supabase.from(table).update(data).eq('id', id).select().single();
}

/**
 * Delete record
 */
export async function remove(table, id) {
    if (!supabase) return { data: null, error: null };
    return supabase.from(table).delete().eq('id', id);
}

export default {
    supabase,
    isSupabaseConfigured,
    getAll,
    getById,
    insert,
    update,
    remove
};
