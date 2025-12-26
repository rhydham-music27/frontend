import { useEffect, useState } from 'react';
import { getOptions, OptionItem } from '@/services/optionsService';

export const useOptions = (type: string) => {
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!type) {
      // No type provided – do not call backend
      setOptions([]);
      setLoading(false);
      setError(null);
      return () => {
        isMounted = false;
      };
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getOptions(type);
        if (isMounted) {
          setOptions(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || 'Failed to load options');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [type]);

  return { options, loading, error };
};
