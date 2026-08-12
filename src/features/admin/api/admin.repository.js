import { supabaseAdmin as supabase } from '../../../lib/supabase';
import { AdminUsersAPI, AdminConfigAPI, checkEdgeFunctionsAvailable } from '../../../lib/edgeFunctions';

let edgeFunctionsAvailable = null;
let profilesTableAvailable = null;

async function shouldUseEdgeFunctions() {
    if (edgeFunctionsAvailable === null) {
        try {
            edgeFunctionsAvailable = await checkEdgeFunctionsAvailable();
        } catch {
            edgeFunctionsAvailable = false;
        }
    }
    return edgeFunctionsAvailable;
}

async function hasProfilesTable() {
    if (profilesTableAvailable !== null) return profilesTableAvailable;
    try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        profilesTableAvailable = !error || error.code !== '42P01';
    } catch {
        profilesTableAvailable = false;
    }
    return profilesTableAvailable;
}

export class AdminRepository {

    static async getUsers({ role, status, search, page = 1, limit: userLimit = 20 }) {
        const available = await hasProfilesTable();
        if (!available) return { users: [], total: 0, page, totalPages: 0 };

        if (await shouldUseEdgeFunctions()) {
            try {
                const result = await AdminUsersAPI.list({ page, limit: userLimit, search, role });
                return result;
            } catch {
                // Fallback to direct query
            }
        }

        try {
            let query = supabase.from('profiles').select('*', { count: 'exact' });
            if (status !== undefined) query = query.eq('is_active', status);
            if (search) {
                query = query.or(`full_name.ilike.%${search}%, document_number.ilike.%${search}%`);
            }

            const from = (page - 1) * userLimit;
            const to = from + userLimit - 1;
            const { data, error, count } = await query.range(from, to);
            if (error) return { users: [], total: 0, page, totalPages: 0 };

            let roleMap = {};
            let depMap = {};
            try {
                const { data: roles } = await supabase.from('roles').select('id, name, description');
                const { data: deps } = await supabase.from('dependencies').select('id, name');
                roles?.forEach(r => { roleMap[r.id] = r; });
                deps?.forEach(d => { depMap[d.id] = d; });
            } catch {
                // Tablas roles/dependencies no existen
            }

            const enriched = data.map(u => ({
                ...u,
                roles: roleMap[u.role_id] || null,
                dependencies: depMap[u.dependency_id] || null,
            }));

            let filtered = enriched;
            if (role) {
                filtered = enriched.filter(u => u.roles?.name === role);
            }

            return { users: filtered, total: count, page, totalPages: Math.ceil(count / userLimit) };
        } catch {
            return { users: [], total: 0, page, totalPages: 0 };
        }
    };

    static async updateUser(userId, updates, adminId) {
        if (await shouldUseEdgeFunctions()) {
            try {
                const result = await AdminUsersAPI.update(userId, updates);
                return result.user;
            } catch {
                // Fallback to direct query
            }
        }

        const { data: oldData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        const { data: newData, error } = await supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;

        await this.logAction({
            userId: adminId,
            action: 'update_user',
            entityType: 'user',
            entityId: userId,
            oldData,
            newData
        });
        return newData;
    }

    static async createUser({ email, password, fullName, documentNumber, roleId, dependencyId }, adminId) {
        if (await shouldUseEdgeFunctions()) {
            try {
                const result = await AdminUsersAPI.create({
                    email,
                    password,
                    fullName,
                    documentNumber,
                    roleId,
                    dependencyId,
                });
                return result.user;
            } catch {
                // Fallback to direct query
            }
        }

        // Fallback: consulta directa con supabaseAdmin
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName, document_number: documentNumber },
        });
        if (authError) throw authError;
        if (!authData.user) throw new Error("No se pudo crear el usuario");

        // Polling: esperar a que el trigger cree el profile (max 5 segundos)
        let profile = null;
        let attempts = 0;
        const maxAttempts = 10;
        const intervalMs = 500;

        while (attempts < maxAttempts) {
            await new Promise(r => setTimeout(r, intervalMs));
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authData.user.id)
                .single();
            
            if (!error && data) {
                profile = data;
                break;
            }
            attempts++;
        }

        if (!profile) {
            throw new Error("Timeout esperando creación del profile");
        }

        // Actualizar el profile con los datos adicionales
        const { data: updatedProfile, error: profileError } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                document_number: documentNumber,
                role_id: roleId,
                dependency_id: dependencyId
            })
            .eq('id', authData.user.id)
            .select()
            .single();

        if (profileError) throw profileError;

        await this.logAction({
            userId: adminId,
            action: 'CREATE_USER',
            entityType: 'user',
            entityId: authData.user.id,
            newData: updatedProfile
        });

        return updatedProfile;
    }

    static async deleteUser(userId, adminId) {
        if (await shouldUseEdgeFunctions()) {
            try {
                await AdminUsersAPI.delete(userId);
                return true;
            } catch {
                // Fallback to direct query
            }
        }

        const { data: oldData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        const { error: profileError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', userId);

        if (profileError) throw profileError;

        const { error: authError } = await supabase.auth.admin.deleteUser(userId);
        if (authError) console.error("Error eliminando usuario de Auth:", authError.message);

        await this.logAction({
            userId: adminId,
            action: 'DELETE_USER',
            entityType: 'user',
            entityId: userId,
            oldData,
            newData: null
        });

        return true;
    }

    static async getAuditlogs({ action, userId, dateFrom, dateTo, page = 1, limit = 50 }) {
        let query = supabase
            .from('audit_logs')
            .select('*', { count: 'exact' });

        if (action) query = query.eq('action', action);
        if (userId) query = query.eq('user_id', userId);
        if (dateFrom) query = query.gte('created_at', dateFrom);
        if (dateTo) query = query.lte('created_at', dateTo);

        const from = (page - 1) * limit;
        const { data, error, count } = await query
            .order('created_at', { ascending: false })
            .range(from, from + limit - 1);

        if (error) throw error;

        // Enriquecer con nombres de admin
        const userIds = [...new Set(data.map(l => l.user_id).filter(Boolean))];
        const { data: profiles } = userIds.length > 0
            ? await supabase.from('profiles').select('id, full_name, email').in('id', userIds)
            : { data: [] };

        const profileMap = {};
        profiles?.forEach(p => { profileMap[p.id] = p; });

        const enriched = data.map(l => ({
            ...l,
            admin: profileMap[l.user_id] || null,
        }));

        return { logs: enriched, total: count };
    }

    static async getConfig() {
        if (await shouldUseEdgeFunctions()) {
            try {
                const result = await AdminConfigAPI.get();
                return result.config;
            } catch {
                // Fallback to direct query
            }
        }

        try {
            const { data, error } = await supabase.from('system_config').select('*');
            if (error) return {};
            return data.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {});
        } catch {
            return {};
        }
    }

    static async updateConfig(key, value, adminId) {
        if (await shouldUseEdgeFunctions()) {
            try {
                const result = await AdminConfigAPI.update(key, value);
                return result.config;
            } catch {
                // Fallback to direct query
            }
        }

        const { data: oldConfig } = await supabase
            .from('system_config')
            .select('*')
            .eq('key', key)
            .single();

        const { data, error } = await supabase
            .from('system_config')
            .update({
                value,
                updated_by: adminId,
                updated_at: new Date()
            })
            .eq('key', key)
            .select()
            .single();

        if (error) throw error;

        await this.logAction({
            userId: adminId,
            action: 'UPDATE_CONFIG',
            entityType: 'config',
            entityId: key,
            oldData: oldConfig,
            newData: data
        });

        return data;
    }

    static async logAction({ userId, action, entityType, entityId, oldData, newData }) {
        const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;

        await supabase.from('audit_logs').insert({
            user_id: userId,
            action,
            entity_type: entityType,
            entity_id: String(entityId),
            old_data: oldData,
            new_data: newData,
            user_agent: userAgent
        });
    }
}
