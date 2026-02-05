import api from './api';

export interface OptionItem {
    _id: string;
    type: string;
    label: string;
    value: string;
    sortOrder?: number;
    parent?: {
        _id: string;
        label: string;
        value: string;
        type: string;
    } | string;
    metadata?: Record<string, any>;
}

export interface OptionTypeItem {
    value: string;
    label: string;
}

export const getOptions = async (type: string, parentId?: string): Promise<OptionItem[]> => {
    const url = parentId 
        ? `/api/options/${encodeURIComponent(type)}?parent=${encodeURIComponent(parentId)}` 
        : `/api/options/${encodeURIComponent(type)}`;
    
    const res = await api.get(url);
    const data = (res.data?.data || []) as any[];
    return data.map((o) => ({
        _id: String(o._id),
        type: String(o.type),
        label: String(o.label),
        value: String(o.value),
        sortOrder: o.sortOrder,
        parent: o.parent,
        metadata: o.metadata
    }));
};

export const getOptionTypes = async (): Promise<OptionTypeItem[]> => {
    const res = await api.get('/api/options/types');
    const data = (res.data?.data || []) as any[];
    return data.map((t) => ({
        value: String(t),
        label: String(t),
    }));
};

export interface OptionPayload {
    type: string;
    label: string;
    value?: string;
    sortOrder?: number;
    parent?: string;
    metadata?: Record<string, any>;
}

// If id is provided → update, else create
export const createOrUpdateOption = async (
    id: string | undefined,
    payload: OptionPayload,
): Promise<OptionItem> => {
    if (id) {
        const res = await api.put(`/api/options/${encodeURIComponent(id)}`, payload);
        const o = res.data?.data;
        return {
            _id: String(o._id),
            type: String(o.type),
            label: String(o.label),
            value: String(o.value),
            sortOrder: o.sortOrder,
            parent: o.parent,
            metadata: o.metadata
        };
    } else {
        const res = await api.post('/api/options', payload);
        const o = res.data?.data;
        return {
            _id: String(o._id),
            type: String(o.type),
            label: String(o.label),
            value: String(o.value),
            sortOrder: o.sortOrder,
            parent: o.parent,
            metadata: o.metadata
        };
    }
};

export const deleteOption = async (id: string): Promise<void> => {
    await api.delete(`/api/options/${encodeURIComponent(id)}`);
};
