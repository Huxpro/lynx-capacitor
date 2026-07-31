/**
 * Prismic is a live external CMS shared with the upstream Capacitor site, and
 * some documents/fields have been removed from it over time (e.g. the
 * community & enterprise pages, landing CTAs). `firstOf` returns the first
 * item of a Prismic slice/list field, or a safe placeholder whose properties
 * all read as empty arrays — so page sections render empty instead of
 * crashing on missing CMS content.
 */
export const firstOf = (field: any): any => {
  if (Array.isArray(field) && field.length > 0) {
    return field[0];
  }
  return new Proxy(
    {},
    {
      get: (_target, prop) => {
        if (typeof prop === 'symbol') {
          return undefined;
        }
        if (prop === 'toString') {
          return () => '';
        }
        return [];
      },
    },
  );
};
