import api from './api';

export interface StudentLoginCredentials {
  studentId: string;
  password: string;
}

export interface StudentLoginResponse {
  student: {
    id: string;
    studentId: string;
    name: string;
    gender: string;
    grade: string;
    finalClass: string;
    classLead: string;
    isPasswordChanged: boolean;
  };
  requiresPasswordChange: boolean;
  accessToken: string;
  refreshToken: string;
}

export const studentLogin = async (credentials: StudentLoginCredentials): Promise<StudentLoginResponse> => {
  const { data } = await api.post('/api/student-auth/login', credentials);
  return data.data;
};

export const changeStudentPassword = async (
  studentId: string,
  currentPassword: string,
  newPassword: string
) => {
  const { data } = await api.post('/api/student-auth/change-password', {
    studentId,
    currentPassword,
    newPassword,
  });
  return data.data;
};

export const getStudentProfile = async (studentId: string) => {
  const { data } = await api.get(`/api/student-auth/profile/${studentId}`);
  return data.data;
};
