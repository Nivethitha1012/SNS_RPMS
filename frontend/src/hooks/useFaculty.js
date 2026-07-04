import { useState, useCallback } from 'react';
import { facultyService } from '../services/facultyService';

export function useFacultyList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const fetchFaculty = useCallback(async (page = 1, limit = 10, search = '', institutionFilters = ['All Institutions']) => {
    setLoading(true);
    setError(null);
    try {
      const response = await facultyService.getFacultyList(page, limit, search, institutionFilters);
      setData(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch faculty list');
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, pagination, fetchFaculty };
}

export function useGlobalFields() {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFields = useCallback(async () => {
    setLoading(true);
    try {
      const response = await facultyService.getGlobalFields();
      setFields(response);
    } catch (err) {
      setError(err.message || 'Failed to fetch global fields');
    } finally {
      setLoading(false);
    }
  }, []);

  const addField = async (name) => {
    setLoading(true);
    try {
      const newField = await facultyService.addField(name);
      setFields(prev => [...prev, newField]);
      return true;
    } catch (err) {
      setError(err.message || 'Failed to add field');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteField = async (id) => {
    setLoading(true);
    try {
      await facultyService.deleteField(id);
      setFields(prev => prev.filter(f => f.id !== id));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to delete field');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { fields, loading, error, fetchFields, addField, deleteField };
}
