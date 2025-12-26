import api from './api';

export interface OptionItem {
    _id: string;
    type: string;
    label: string;
    value: string;
}

export interface OptionTypeItem {
    value: string;
    label: string;
}

export const getOptions = async (type: string): Promise<OptionItem[]> => {
    const res = await api.get(`/api/options/${encodeURIComponent(type)}`);
    const data = (res.data?.data || []) as any[];
    return data.map((o) => ({
        _id: String(o._id),
        type: String(o.type),
        label: String(o.label),
        value: String(o.value),
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
        };
    } else {
        const res = await api.post('/api/options', payload);
        const o = res.data?.data;
        return {
            _id: String(o._id),
            type: String(o.type),
            label: String(o.label),
            value: String(o.value),
        };
    }
};

export const deleteOption = async (id: string): Promise<void> => {
    await api.delete(`/api/options/${encodeURIComponent(id)}`);
};
