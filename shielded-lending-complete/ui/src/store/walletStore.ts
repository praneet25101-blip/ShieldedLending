import { create } from 'zustand';

interface WalletState {
  connected: boolean;
  address: string | null;
  balance: string;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  connected: false,
  address: null,
  balance: '0',
  connecting: false,

  connect: async () => {
    set({ connecting: true });
    
    try {
      // Check if Lace wallet is installed
      if (!(window as any).midnight) {
        alert('Please install Lace wallet extension for Midnight Network');
        set({ connecting: false });
        return;
      }

      // Request wallet connection
      const accounts = await (window as any).midnight.request({
        method: 'midnight_requestAccounts'
      });

      if (accounts && accounts.length > 0) {
        const address = accounts[0];
        
        // Get balance
        const balance = await (window as any).midnight.request({
          method: 'midnight_getBalance',
          params: [address]
        });

        set({
          connected: true,
          address,
          balance: balance || '0',
          connecting: false
        });
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      set({ connecting: false });
    }
  },

  disconnect: () => {
    set({
      connected: false,
      address: null,
      balance: '0'
    });
  }
}));
