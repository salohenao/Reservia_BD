import React from 'react';

export default function StatsBanner() {
  const stats = [
    {
      value: '12.400+',
      label: 'Citas este mes',
    },
    {
      value: '680',
      label: 'Negocios activos',
    },
    {
      value: '98%',
      label: 'Satisfacción',
    },
    {
      value: '< 2 min',
      label: 'Tiempo de reserva',
    },
  ];

  return (
    <section className="w-full bg-[#025a4e] py-10 px-6 sm:px-8 lg:px-12 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-teal-700/50">
          {stats.map((stat, idx) => (
            <div key={idx} className={`${idx !== 0 ? 'pt-4 md:pt-0' : ''}`}>
              <p className="text-3xl sm:text-4xl lg:text-[40px] font-bold font-serif tracking-tight text-white">
                {stat.value}
              </p>
              <p className="text-xs sm:text-[13px] text-teal-100 font-normal mt-1.5 opacity-90">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
