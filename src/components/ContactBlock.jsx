import React from 'react';
import config from '../config';

const ContactBlock = ({ isDark, extraText }) => {
  return (
    <div className={`inline-block p-5 rounded-xl text-sm ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}>
      <p className={`font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>SNS Publications Support</p>
      <div className="space-y-1">
        <p>Email: <a href={`mailto:${config.supportEmail}`} className="text-emerald-600 hover:underline">{config.supportEmail}</a></p>
        <p>Phone: <a href={`tel:${config.supportPhone.replace(/\\s+/g, '')}`} className="text-emerald-600 hover:underline">{config.supportPhone}</a></p>
        <p>Address: {config.supportAddress}</p>
        {extraText && <p className={`text-xs mt-2 pt-2 border-t ${isDark ? 'text-slate-500 border-white/10' : 'text-slate-400 border-slate-200'}`}>{extraText}</p>}
      </div>
    </div>
  );
};

export default ContactBlock;
