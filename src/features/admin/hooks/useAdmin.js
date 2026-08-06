import { useState, useCallback } from 'react';
import { AdminRepository } from '../api/admin.repository'
import { useAuth } from '../../../providers/AuthProvider';
import { toast } from 'sonner';

export function useAdmin(){
    const{ user } = useAuth();
    const [users, setUsers] = useState([]);
    const [auditLogs, setAuditLogs] = useState([]);
    const [config, setConfig] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0})
    const [loading, setLoading] = useState(false);

    const fetchUsers = useCallback(async (filters={})=>{
        setLoading(true);
        try{
            const result = await AdminRepository.getUsers(filters);
            setUsers(result.users);
            setPagination({
                page:result.page,
                totalPages:result.totalPages,
                total: result.total
            })
        }catch{
            toast.error('Error cargando usuarios');
        }finally{
            setLoading(false);
        }
    },[])

    const updateUserRole = async (userId,{roleId, dependencyId, isActive}) =>{
        try{
            await AdminRepository.updateUser(userId,{
                role_id:roleId,
                dependency_id: dependencyId,
                is_active: isActive
            },user.id)

            toast.success('usuario actualizado');
            await fetchUsers();
        }catch(err){
            toast.error(err.message);
        }
    }

    const createUser = async(userData)=>{
        try {
            await AdminRepository.createUser(userData, user.id);
            toast.success('Usuario creado exitosamente');
            await fetchUsers();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const deleteUser = async (userId) => {
        try {
            await AdminRepository.deleteUser(userId, user.id);
            toast.success('Usuario eliminado exitosamente');
            await fetchUsers();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const fetchAuditLogs = useCallback(async(filters = {})=>{
        setLoading(true);
        try{
            const result = await AdminRepository.getAuditlogs(filters);
            setAuditLogs(result.logs);
        }catch{
            toast.error('Error cargando auditoria');
        } finally {
            setLoading(false);
        }
    },[]);

    const fetchConfig = useCallback(async()=>{
        try{
            const data = await AdminRepository.getConfig();
            setConfig(data);
        }catch{
            toast.error('Error cargando configuracion');
        }
    },[]);

    const updateConfig = async (key, value)=>{
        try{
            await AdminRepository.updateConfig(key, value, user.id);
            toast.success('configuracion actualizada');
            await fetchConfig();
        }catch(err){
            toast.error(err.message);
        }
    };

    return {
        users,
        auditLogs,
        config,
        pagination,
        loading,
        fetchUsers,
        updateUserRole,
        createUser,
        deleteUser,
        fetchAuditLogs,
        fetchConfig,
        updateConfig
    }

}
