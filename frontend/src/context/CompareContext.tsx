import React, { createContext, useContext, useState } from 'react';
import type { Product } from '../types';

interface CompareContextType {
  compareList: Product[];
  addToCompare: (product: Product) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [compareList, setCompareList] = useState<Product[]>(() => {
    const saved = localStorage.getItem('jmz_compare_list');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  const saveList = (list: Product[]) => {
    setCompareList(list);
    localStorage.setItem('jmz_compare_list', JSON.stringify(list));
  };

  const addToCompare = (product: Product): boolean => {
    if (compareList.length >= 4) {
      alert('You can compare up to 4 phones at a time.');
      return false;
    }
    if (compareList.some((p) => p._id === product._id)) {
      return true;
    }
    saveList([...compareList, product]);
    return true;
  };

  const removeFromCompare = (productId: string) => {
    saveList(compareList.filter((p) => p._id !== productId));
  };

  const clearCompare = () => {
    saveList([]);
  };

  const isInCompare = (productId: string) => {
    return compareList.some((p) => p._id === productId);
  };

  return (
    <CompareContext.Provider
      value={{
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};

export function useCompare(): CompareContextType {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
