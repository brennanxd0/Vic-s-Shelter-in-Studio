
import { MOCK_APPLICATIONS } from "../constants";
import { AdoptionApplication } from "../types";

export const fetchPendingApplicationsCount = async (): Promise<number> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  return MOCK_APPLICATIONS.filter(app => app.status === 'pending').length;
};

export const fetchApplications = async (): Promise<AdoptionApplication[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [...MOCK_APPLICATIONS];
};
