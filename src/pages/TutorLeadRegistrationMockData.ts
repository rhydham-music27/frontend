// Mock data for city-area mapping
export const mockCityAreas = {
  'Bhopal': ['Arera Colony', 'MP Nagar', 'Kolar Road', 'Hoshangabad Road', 'Berasia Road', 'Ayodhya Bypass', 'Bairagarh', 'Katara Hills', 'Shahpura', 'Jahangirabad', 'Govindpura', 'Ashoka Garden', 'Bawadiya Kalan', 'Raisen Road']
} as const;

export const mockRootProps = {
  onSubmit: (data: any) => console.log('Lead form submitted:', data),
  isLoading: false as const
};