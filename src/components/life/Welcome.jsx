import React from 'react';

function Welcome({ onStart }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-6">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,700;9..144,900&family=Inter:wght@400;500;600&display=swap');`}</style>
      <div className="max-w-lg">
        <div className="text-xs uppercase tracking-[0.2em] text-stone-500 mb-4" style={{ fontFamily: 'Inter' }}>
          The next 12 months
        </div>
        <h1 style={{ fontFamily: 'Fraunces, serif' }} className="text-5xl md:text-6xl font-black tracking-tight leading-[0.95]">
          Run far.<br />
          <span className="italic font-normal text-stone-600">Build the</span>{' '}
          <span className="text-orange-600">long game.</span>
        </h1>
        <p className="mt-6 text-stone-700 leading-relaxed" style={{ fontFamily: 'Inter' }}>
          Study, runs, strength, recovery, reading — all in one place. A hybrid athlete builds slowly. So does a career. Both stack.
        </p>
        <p className="mt-4 text-stone-700 leading-relaxed" style={{ fontFamily: 'Inter' }}>
          520 study hours. 6 workouts a week. 5K → 10K → half marathon. One year.
        </p>
        <button onClick={onStart}
          className="mt-8 group bg-stone-900 text-white px-8 py-4 rounded-full font-medium hover:bg-orange-600 transition-colors flex items-center gap-2"
          style={{ fontFamily: 'Inter' }}>
          Start the clock
          <span className="group-hover:translate-x-1 transition-transform">→</span>
        </button>
        <p className="mt-4 text-xs text-stone-500" style={{ fontFamily: 'Inter' }}>
          Today is day 1. Showing up tomorrow is the whole game.
        </p>
      </div>
    </div>
  );
}

export default Welcome;
