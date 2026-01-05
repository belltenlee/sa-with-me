'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

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
      { bank: '농협은행', number: '302-1639-137951', holder: '남순자' },
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
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const handleCopy = async (number: string) => {
    try {
      await navigator.clipboard.writeText(number);
      toast.success('계좌번호가 복사되었습니다 ✨');
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('복사에 실패했습니다.');
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
            <div key={group.label} className="border border-[#EBC7C7]/20 rounded-2xl overflow-hidden bg-white/40 backdrop-blur-[2px]">
              <button
                onClick={() => toggleGroup(group.label)}
                className="w-full px-6 py-5 flex justify-between items-center hover:bg-white/60 transition-all duration-300 group"
              >
                <span className={`text-[15px] font-semibold tracking-tight transition-colors duration-300 ${openGroup === group.label ? 'text-[#D99A9A]' : 'text-charcoal/80'}`}>
                  {group.label}
                </span>
                <motion.span
                  animate={{ rotate: openGroup === group.label ? 180 : 0 }}
                  className={`${openGroup === group.label ? 'text-[#D99A9A]' : 'text-charcoal/30'}`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </motion.span>
              </button>

              <AnimatePresence>
                {openGroup === group.label && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  >
                    <div className="bg-white/80 p-6 space-y-5 border-t border-[#EBC7C7]/10">
                      {group.accounts.map((account, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <div className="space-y-1">
                            <p className="text-charcoal font-bold text-[15px]">
                              {account.holder}
                            </p>
                            <p className="text-charcoal/50 text-[13px] tracking-tight">
                              {account.bank} <span className="text-[#EBC7C7]">|</span> {account.number}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCopy(account.number)}
                            className="px-4 py-1.5 text-[11px] font-bold text-[#D99A9A] bg-white border border-[#EBC7C7]/40 rounded-full hover:bg-[#FFF5F5] hover:border-[#D99A9A]/60 transition-all duration-300 active:scale-95"
                          >
                            복사
                          </button>
                        </div>
                      ))}
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