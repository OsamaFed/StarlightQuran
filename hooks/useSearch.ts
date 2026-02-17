import { useState, useCallback, useEffect } from "react";
import { useDebounce } from "usehooks-ts";

export interface UseSearchOptions {
  debounceDelay?: number;
  onSearch?: (query: string) => void;
}

export function useSearch(options: UseSearchOptions = {}) {
  const { debounceDelay = 300, onSearch } = options;

  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, debounceDelay);

  
  useEffect(() => {
    if (onSearch) {
      onSearch(debouncedQuery);
    }
    
  }, [debouncedQuery]);
  

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    debouncedQuery,
    clearSearch,
    isSearching: searchQuery !== debouncedQuery,
  };
}
