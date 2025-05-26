'use client';

import { useState } from 'react';
import { motion as m } from 'framer-motion';

interface AccountInfo {
  bank: string;
  number: string;
  holder: string;
  relation: string;
}

const accounts: AccountInfo[] = [
  {
    bank: '신한은행',
    number: '110-123-456789',
    holder: '김철수',
    relation: '신랑',
  },
  {
    bank: '국민은행',
    number: '123-12-123456',
    holder: '이영희',
    relation: '신부',
  },
];

export default function Account() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (account: AccountInfo, index: number) => {
    try {
      await navigator.clipboard.writeText(account.number);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('계좌번호 복사 중 오류가 발생했습니다:', err);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">축의금 계좌번호</h2>
      <div className="space-y-4">
        {accounts.map((account, index) => (
          <m.div
            key={account.number}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="bg-white rounded-lg shadow-md p-4"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">{account.relation}</span>
              <span className="text-sm text-gray-500">{account.bank}</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{account.holder}</p>
                <p className="text-gray-700">{account.number}</p>
              </div>
              <button
                onClick={() => handleCopy(account, index)}
                className="ml-4 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
              >
                {copiedIndex === index ? (
                  <span className="text-green-600">복사완료</span>
                ) : (
                  <span>복사하기</span>
                )}
              </button>
            </div>
          </m.div>
        ))}
      </div>
      <p className="text-center text-gray-500 text-sm mt-4">
        계좌번호를 클릭하시면 복사됩니다
      </p>
    </div>
  );
} 