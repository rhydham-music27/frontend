import { useEffect, useState } from 'react';
import { getOptions, OptionItem } from '@/services/optionsService';

export const useOptions = (type: string, parentId?: string | null) => {
  const [options, setOptions] = useState<OptionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to manually refetch
  const fetchOptions = async () => {
    if (!type || parentId === null) {
        setOptions([]);
        return;
    }
    setLoading(true);
    setError(null);
    try {
        const data = await getOptions(type, parentId);
        setOptions(data);
    } catch (err: any) {
        setError(err?.message || 'Failed to load options');
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (!type || parentId === null) {
      setOptions([]);
      setLoading(false);
      setError(null);
      return;
    }

    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getOptions(type, parentId);
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
  }, [type, parentId]);

  return { options, loading, error, refetch: fetchOptions };
};
