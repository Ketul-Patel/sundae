'use client';

import {PrivyProvider} from '@privy-io/react-auth';
import {baseSepolia, base} from 'viem/chains';
import {SmartWalletsProvider} from '@privy-io/react-auth/smart-wallets';

export default function Providers({children}: {children: React.ReactNode}) {
  return (
    <PrivyProvider
      appId="cm8ifkze901zhhbyodcdtgi0g"
      clientId="client-WY5i2GmHp9NW2kmGgqNjXR7FJz8pYJ9CzgPRd9X3uAH7n"
      config={{
        defaultChain: base,
        appearance: {
          theme: 'light',
        },
        embeddedWallets: {
          createOnLogin: 'all-users', // Anything other than 'off' will not be honored with whitelabel Auth. You must use createWallet from usePrivy()
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}