import { businessApi } from '@/api/business.api';
import { saveBusinessId, getBusinessId } from '@/utils/tokenStorage';
import { ROUTES } from '@/constants/routes';

export const loadBusinesses = async () => {
  return await businessApi.getBusinesses();
};

export const createBusiness = async (payload) => {
  return await businessApi.createBusiness(payload);
};

export const selectBusiness = (businessId) => {
  saveBusinessId(businessId);
};

export const initializeBusiness = async () => {
  const businessId = getBusinessId();
  if (businessId) {
    return { businessId, route: ROUTES.DASHBOARD };
  }

  const businesses = await loadBusinesses();
  if (!businesses || businesses.length === 0) {
    return { businessId: null, route: ROUTES.BUSINESS_CREATE };
  } else if (businesses.length === 1) {
    const id = businesses[0].businessId;
    selectBusiness(id);
    return { businessId: id, route: ROUTES.DASHBOARD };
  } else {
    return { businessId: null, route: ROUTES.BUSINESS_SELECT };
  }
};

export const businessService = {
  initializeBusiness,
  loadBusinesses,
  selectBusiness,
  createBusiness,
};
