import type { Metadata } from 'next';

import './decision-room.css';

export const metadata: Metadata = {
  title: '决策室',
  description: '一段 20 分钟的结构化对话，帮你把自己想清楚。',
};

export default function DecisionRoomLayout({ children }: { children: React.ReactNode }) {
  return <div className='dr-root'>{children}</div>;
}
