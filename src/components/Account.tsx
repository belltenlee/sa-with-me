'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AccountInfo {
  bank: string;
  number: string;
  holder: string;
}

interface AccountGroup {
  label: string;
  accounts: AccountInfo[];
}

const accountGroups: AccountGroup[] = [
  {
    label: '신랑 측 마음 전하실 곳',
    accounts: [
      { bank: '농협은행', number: '123-456-789', holder: '남순자' },
      { bank: '신한은행', number: '110-475-959829', holder: '이종열' },
    ],
  },
  {
    label: '신부 측 마음 전하실 곳',
    accounts: [
      { bank: '국민은행', number: '795302-04-164976', holder: '장숙희' },
      { bank: '신한은행', number: '110-379-626879', holder: '박성애' },
    ],
  },
];

export default function Account() {
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const handleCopy = async (number: string, id: string) => {
    try {
      await navigator.clipboard.writeText(number);
      setCopiedIndex(id);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleGroup = (label: string) => {
    setOpenGroup(openGroup === label ? null : label);
  };

  return (
    <section className="py-16 px-6 bg-[#F8F6F2]">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.6 }}
            className="inline-block px-10 py-4 border border-[#EBC7C7] rounded-[50%] mb-6 bg-[#FFF5F5] shadow-[0_4px_15px_rgba(235,199,199,0.3)]"
          >
            <h2 className="font-paperlogy font-semibold text-2xl text-[#D99A9A] tracking-widest">마음 전하실 곳</h2>
          </motion.div>
          <p className="font-pretendard text-charcoal/60 text-sm">축의금 계좌</p>
        </motion.div>

        <div className="space-y-4 font-pretendard">
          {accountGroups.map((group) => (
            <div key={group.label} className="border border-gray-100 rounded-lg overflow-hidden">
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full px-6 py-4 flex justify-between items-center bg-cream/30 hover:bg-cream/50 transition-colors"
              >
                <span className="text-charcoal font-medium whitespace-nowrap">{group.label}</span>
                <span className={`transform transition-transform duration-300 ${openGroup === group.label ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              <AnimatePresence>
                {openGroup === group.label && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="bg-white p-6 space-y-4 border-t border-gray-100">
                      {group.accounts.map((account, idx) => {
                        const id = `${group.label}-${idx}`;
                        return (
                          <div key={idx} className="flex justify-between items-center">
                            <div className="text-sm">
                              <p className="text-charcoal mb-1">
                                <span className="font-bold">{account.holder}</span>
                              </p>
                              <p className="text-gray-500">{account.bank} {account.number}</p>
                            </div>
                            <button
                              onClick={() => handleCopy(`${account.bank} ${account.number}`, id)}
                              className="px-3 py-1.5 text-xs border border-gray-200 rounded-full hover:border-gold hover:text-gold transition-colors"
                            >
                              {copiedIndex === id ? '복사완료' : '복사하기'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}