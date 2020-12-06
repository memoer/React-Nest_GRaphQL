import { CommonOutput } from 'common/dtos/output.dto';

interface BasicWrapTryCatch {
  <T extends Promise<CommonOutput>, U extends CommonOutput>(executeFn: T): Promise<U>;
  <T extends Promise<CommonOutput>, U extends CommonOutput>(executeFn: () => T): Promise<U>;
}
export const basicWrapTryCatch: BasicWrapTryCatch = async executeFn => {
  try {
    return await (typeof executeFn === 'function' ? executeFn() : executeFn);
  } catch (error) {
    return { ok: false, error };
  }
};
