/**
 * Sumsub Configuration Interface
 */
export interface SumsubConfig {
  appToken: string;
  appSecret: string;
  apiUrl: string;
  isConfigured: boolean;
}

/**
 * Sumsub Configuration Token for Dependency Injection
 */
export const SUMSUB_CONFIG = 'SUMSUB_CONFIG';

