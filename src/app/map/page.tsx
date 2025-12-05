'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

// Dynamic import to avoid SSR issues with Leaflet
const MapView = dynamic(() => import('@/components/map/MapView'), {
    ssr: false,
    loading: () => (
        <div className="w-full h-screen flex items-center justify-center bg-navy-deep">
            <Loader2 className="w-12 h-12 text-cyan-bright animate-spin" />
        </div>
    )
});

import { Project } from '@/types';

export default function MapPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [filters, setFilters] = useState<{
        poolTypes: string[];
        yearRange: number[];
        budgetRange: number[];
    }>({
        poolTypes: [],
        yearRange: [2020, 2024],
        budgetRange: [0, 15000000]
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [projects, filters]);

    const fetchProjects = async () => {
        try {
            const { data, error } = await supabase
                .from('project_locations')
                .select('*')
                .order('completion_date', { ascending: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        }
    };

    const applyFilters = () => {
        let filtered = projects;

        if (filters.poolTypes.length > 0) {
            filtered = filtered.filter(p => filters.poolTypes.includes(p.pool_type));
        }

        filtered = filtered.filter(p => {
            if (!p.completion_date) return false;
            const year = new Date(p.completion_date).getFullYear();
            return year >= filters.yearRange[0] && year <= filters.yearRange[1];
        });

        filtered = filtered.filter(p => {
            const budget = p.budget || 0;
            return budget >= filters.budgetRange[0] && budget <= filters.budgetRange[1];
        });

        setFilteredProjects(filtered);
    };

    return (
        <div className="relative w-full h-screen overflow-hidden">
            <MapView projects={filteredProjects} filters={filters} setFilters={setFilters} />
        </div>
    );
}
