import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiService } from '../services/apiService';
import { AxiosError } from 'axios';

interface Prospect {
  _id: string;
  name: string;
  type: 'Individual' | 'Company';
  loanType: string;
  stage: string;
  assignedTo: string;
  status: string;
  documentsByStage: any;
  currentStage: string;
  openStages: string[];
  createdAt: string;
  code: string;
}

interface UseProspectsOptions {
  page?: number;
  limit?: number;
  status?: string;
  assignedTo?: string;
}

export function useProspects(options: UseProspectsOptions = {}) {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(options.page || 1);

  const fetchProspects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getProspects();
      setProspects(data);
      setTotalCount(data.length); // En el futuro, esto vendría del backend
    } catch (err) {
      const errorMessage = err instanceof AxiosError 
        ? err.response?.data?.message || 'Failed to fetch prospects'
        : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error fetching prospects:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtros aplicados en el cliente (en el futuro se moverían al backend)
  const filteredProspects = useMemo(() => {
    let filtered = [...prospects];
    
    if (options.status) {
      filtered = filtered.filter(p => p.status === options.status);
    }
    
    if (options.assignedTo) {
      filtered = filtered.filter(p => p.assignedTo === options.assignedTo);
    }
    
    return filtered;
  }, [prospects, options.status, options.assignedTo]);

  // Paginación aplicada en el cliente
  const paginatedProspects = useMemo(() => {
    const limit = options.limit || 10;
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredProspects.slice(startIndex, endIndex);
  }, [filteredProspects, currentPage, options.limit]);

  const totalPages = useMemo(() => {
    const limit = options.limit || 10;
    return Math.ceil(filteredProspects.length / limit);
  }, [filteredProspects.length, options.limit]);

  const updateProspect = useCallback((updatedProspect: Prospect) => {
    setProspects(prev => 
      prev.map(p => p._id === updatedProspect._id ? updatedProspect : p)
    );
  }, []);

  const addProspect = useCallback((newProspect: Prospect) => {
    setProspects(prev => [newProspect, ...prev]);
  }, []);

  const removeProspect = useCallback((prospectId: string) => {
    setProspects(prev => prev.filter(p => p._id !== prospectId));
  }, []);

  useEffect(() => {
    fetchProspects();
  }, [fetchProspects]);

  return {
    prospects: paginatedProspects,
    allProspects: prospects,
    filteredProspects,
    loading,
    error,
    totalCount: filteredProspects.length,
    currentPage,
    totalPages,
    setCurrentPage,
    refetch: fetchProspects,
    updateProspect,
    addProspect,
    removeProspect
  };
}
