// Shared building blocks for the Life space views.
// Extracted from the original tracker_v2.jsx and made into a reusable module.

import React from 'react';
import { Flame } from 'lucide-react';

function Card({ children }) {
  return <div className="bg-white rounded-2xl border border-stone-200 p-5">{children}</div>;
}
function Label({ children }) {
  return <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">{children}</div>;
}
function MiniButton({ children, active, onClick, small }) {
  return (
    <button onClick={onClick}
      className={`${small ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-sm'} rounded-full font-medium transition-colors ${
        active ? 'bg-stone-900 text-white' : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
      }`}>
      {children}
    </button>
  );
}
function Badge({ children, color }) {
  const colors = {
    orange: 'bg-orange-50 text-orange-800 border-orange-200',
    red: 'bg-red-50 text-red-800 border-red-200',
    indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    green: 'bg-green-50 text-green-800 border-green-200',
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${colors[color]}`}>{children}</span>;
}
function StreakCard({ icon: Icon, label, streak, days, color }) {
  const colors = {
    orange: 'bg-orange-50 border-orange-200 text-orange-900',
    red: 'bg-red-50 border-red-200 text-red-900',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-900',
  };
  const iconColors = { orange: 'text-orange-600', red: 'text-red-600', indigo: 'text-indigo-600' };
  return (
    <div className={`rounded-xl border p-3 ${colors[color]}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={14} className={iconColors[color]} />
        <div className="text-[10px] uppercase tracking-wider font-semibold">{label}</div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-serif text-2xl font-bold">{streak}</span>
        <Flame size={12} className={iconColors[color]} />
      </div>
      <div className="text-[10px] mt-0.5 opacity-70">{days} total days</div>
    </div>
  );
}
function StatCard({ label, value, suffix, color = 'text-stone-900' }) {
  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4">
      <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold">{label}</div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className={`font-serif text-3xl font-bold ${color}`}>{value}</span>
        <span className="text-xs text-stone-500">{suffix}</span>
      </div>
    </div>
  );
}

export { Card, Label, MiniButton, Badge, StreakCard, StatCard };
