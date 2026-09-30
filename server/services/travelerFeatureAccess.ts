import { isActiveAdmin } from './accountAuthorization';
import { getExplorerPass } from './passService';

export type TravelerFeatureAccessSource = 'none' | 'paid_pass' | 'admin_qa';

export interface TravelerFeatureAccess {
  granted: boolean;
  source: TravelerFeatureAccessSource;
  pass: Awaited<ReturnType<typeof getExplorerPass>>;
}

interface TravelerFeatureAccessDependencies {
  isActiveAdmin: typeof isActiveAdmin;
  getExplorerPass: typeof getExplorerPass;
}

const defaults: TravelerFeatureAccessDependencies = {
  isActiveAdmin,
  getExplorerPass,
};
export async function getTravelerFeatureAccess(
  uid: string,
  overrides: Partial<TravelerFeatureAccessDependencies> = {}
): Promise<TravelerFeatureAccess> {
  if (!uid) throw new Error('Authenticated uid is required.');

  const deps = { ...defaults, ...overrides };

  if (await deps.isActiveAdmin(uid)) {
    return { granted: true, source: 'admin_qa', pass: null };
  }

  const pass = await deps.getExplorerPass(uid);
  if (pass) {
    return { granted: true, source: 'paid_pass', pass };
  }

  return { granted: false, source: 'none', pass: null };
}
