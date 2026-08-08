/**
 * Referral System Configuration
 */

export const COMMON_REFERRAL_CODE = 'LOTTERY777';
export const REFERRAL_REWARD = 50;

export const getBaseUrl = () => {
  // Priority: Environment Variable > Current Origin
  const envUrl = import.meta.env.VITE_APP_URL;
  if (envUrl) return envUrl.replace(/\/$/, ''); // Remove trailing slash
  return window.location.origin;
};

export const getReferralLink = () => {
  return `${getBaseUrl()}/signup?ref=${COMMON_REFERRAL_CODE}`;
};
