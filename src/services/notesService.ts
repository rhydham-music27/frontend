import api from './api';
import { API_ENDPOINTS } from '../constants';
import type { ApiResponse } from '../types';

export interface NoteItemDto {
  id: string;
  name: string;
  type: 'FOLDER' | 'FILE';
  mimeType?: string;
  grade?: string;
  url?: string;
}

export const listNotes = async (parentId: string | null) => {
  const url = parentId ? API_ENDPOINTS.NOTES_FOLDER_ITEMS(parentId) : API_ENDPOINTS.NOTES_ITEMS;
  const res = await api.get<ApiResponse<NoteItemDto[]>>(url);
  return res.data;
};

export const listTutorNotes = async (parentId: string | null) => {
  const url = parentId ? `/api/notes/tutor-notes?parentId=${parentId}` : '/api/notes/tutor-notes';
  const res = await api.get<ApiResponse<NoteItemDto[]>>(url);
  return res.data;
};

export const listParentNotes = async (parentId: string | null) => {
  const url = API_ENDPOINTS.NOTES_PARENT_ITEMS(parentId);
  const res = await api.get<ApiResponse<NoteItemDto[]>>(url);
  return res.data;
};

export const createFolder = async (payload: { name: string; parentId: string | null; grade?: string }) => {
  const body: any = { name: payload.name };
  if (payload.parentId) body.parentId = payload.parentId;
  if (payload.grade) body.grade = payload.grade;
  const res = await api.post<ApiResponse<NoteItemDto>>(API_ENDPOINTS.NOTES_FOLDERS, body);
  return res.data;
};

export const uploadNoteFile = async (payload: { file: File; parentId: string | null; grade?: string }) => {
  const formData = new FormData();
  formData.append('file', payload.file);
  if (payload.parentId) {
    formData.append('parentId', payload.parentId);
  }
  if (payload.grade) {
    formData.append('grade', payload.grade);
  }
  const res = await api.post<ApiResponse<NoteItemDto>>(API_ENDPOINTS.NOTES_FILES, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};
