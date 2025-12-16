export const StatsCard = ({ icon: Icon, label, value, iconColor, valueColor }) => {
  return (
    <div className="bg-[#161616] border-2 border-[#252525] rounded-3xl p-12 hover:border-[#94C705] transition-all">
      <div className="flex flex-col items-start">
        <div className="w-28 h-28 bg-[#0F0F0F] border border-[#252525] rounded-full flex items-center justify-center mb-14">
          <Icon className={iconColor} size={50} strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-4 text-white" style={{fontFamily: "'Suisse Int'l', sans-serif", fontWeight: 700}}>
            {label}
          </h3>
          <p className={`text-2xl font-bold ${valueColor}`} style={{fontFamily: "'Suisse Int'l', sans-serif", fontWeight: 700}}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};
