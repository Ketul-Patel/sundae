'use client';

import type { Attachment, UIMessage } from 'ai';
import { useChat } from '@ai-sdk/react';
import { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, generateUUID } from '@/lib/utils';
import { MultimodalInput } from './multimodal-input';
import { Messages } from './messages';
import { useArtifactSelector } from '@/hooks/use-artifact';
import { toast } from 'sonner';
import { ConnectedWallet, usePrivy, useWallets, Wallet } from '@privy-io/react-auth';
import { useSendTransaction } from '@privy-io/react-auth';
import {createPublicClient, createWalletClient, custom, getAbiItem, parseAbi, toFunctionSelector, http, encodeFunctionData} from 'viem';
import { baseSepolia, base } from 'viem/chains';

export function Chat({
  id,
  initialMessages,
  selectedChatModel,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  selectedChatModel: string;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();

  const { ready, authenticated, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const [wallet, setWallet] = useState<ConnectedWallet | null>(null);
  useEffect(() => {
    setWallet(wallets[0]);
  }, [wallets]);

  const [keepCalling, setKeepCalling] = useState(0);

  const { sendTransaction } = useSendTransaction();

  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    getAccessToken().then((token) => {
      setAccessToken(token);
    });
  }, []);

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
  } = useChat({
    id,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: { id, selectedChatModel: selectedChatModel },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: (message) => {
      console.log("onFinish!!!", message, keepCalling);
      if(message.role === 'assistant') {
        const lastPart = message.parts?.[message.parts?.length - 1] as any;
        if(lastPart?.type === 'tool-invocation') {
          if(lastPart.toolInvocation?.args?.isLastStep === false) {
            append({
              role: 'assistant',
              content: 'Lets move on to the next step!'
            })
          }
          // } else {
          //   append({
          //     role: 'assistant',
          //     content: 'I have finished executing the user request!'
          //   })
          // }
        }
      }
      mutate('/api/history');
    },
    onError: () => {
      toast.error('An error occured, please try again!');
    },
    onToolCall: async ({toolCall}) => {
      console.log("toolCall!!!", toolCall);

      const provider = await wallet?.getEthereumProvider();

      const publicClient = createPublicClient({
        transport: http("https://api.developer.coinbase.com/rpc/v1/base/8blXK2wuyRm89IAlxlMC9tUHDYrT9H7m"),
        chain: base,
      });

      const walletClient = createWalletClient({
        account: wallet?.address as `0x${string}`,
        transport: custom(provider!),
        chain: base,
      });

      if (toolCall.toolName === 'executeContractLevelInteraction') {

        console.log("executeContractLevelInteraction", toolCall.args);
        const args = toolCall.args as { recallKey: string, address: `0x${string}`, functionName: string, functionArgs: string[], amount: `0x${string}`, chain: string, readOnly: boolean, isLastStep: boolean, messageAfterCompletion: string };

        if (!args.isLastStep) {
          setKeepCalling(1);
        } else {
          setKeepCalling(2);
        }

        const abi = await fetch('/api/contracts', {
          method: 'POST',
          body: JSON.stringify({ recallKey: args.recallKey, functionName: args.functionName }),
        });

        const abiData = await abi.json();

        try {
          if (args.readOnly) {
            const data = await publicClient.readContract({
              address: args.address,
              abi: abiData,
              functionName: args.functionName,
              args: args.functionArgs,
            });

            console.log("read only data", data);
            return data;

          } else {
            
            const { request } = await publicClient.simulateContract({
              account: wallet?.address as `0x${string}`,
              address: args.address,
              abi: abiData,
              functionName: args.functionName,
              args: args.functionArgs,
            });

            // const functionData = encodeFunctionData({
            //   abi: abiData,
            //   functionName: args.functionName,
            //   args: args.functionArgs,
            // });

            // const txHash = await sendTransaction({
            //   to: args.address,
            //   value: args.amount,
            //   data: functionData,
            // }, {
            //   uiOptions: {
            //     showWalletUIs: false,
            //   }
            // })

            const txHash = await walletClient.writeContract(request);

            console.log("transaction request", txHash);
            return txHash;
          }

      } catch (error) {
        console.error("error", error);
        return "An error occured, please try again!";
      }

      }
    },
  });


  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          status={status}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
          )}
        </form>
      </div>
    </>
  );
}
