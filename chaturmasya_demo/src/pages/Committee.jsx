import React from "react";
import { User, Phone, ShieldCheck, Users } from "lucide-react";

export default function CommitteeSection() {
  const mainCommittee = [
    { name: "Shri Mohan Shet M K", role: "Honorary President" },
    { name: "Shri Arun Kumar M S", role: "President" },
    { name: "Shri Manjunatha V Varnekar", role: "Working President" },
    { name: "Shri Suryakantha N Raikar", role: "Chief Secretary" },
    { name: "Shri Raghavendra R", role: "Treasurer" },
  ];

  const subCommittees = [
    { title: "Alankara Samithi", coord: "Shri Prashantha M Shet", phone: "+91 9900797631" },
    { title: "Cultural Desk", coord: "Shri CA Shashikanth", phone: "+91 9448519501" },
    { title: "Seva Desk (Women)", coord: "Smt. Mamatha Arun", phone: "+91 9739493673" },
  ];

  return (
    <section className="w-full max-w-4xl mx-auto p-5 sm:p-8 bg-white rounded-2xl shadow-sm border border-stone-200">
      
      {/* Header */}
      <div className="mb-8 border-b border-stone-100 pb-5">
        <p className="text-xs font-bold uppercase tracking-widest text-[#722013] mb-1">
          Chaturmasya 2026
        </p>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2a0b06]">
          Organizing Committee
        </h2>
      </div>

      <div className="space-y-10">
        
        {/* --- CORE COMMITTEE SECTION --- */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <ShieldCheck size={18} className="text-[#722013]" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#722013]">
              Core Committee
            </h3>
            <div className="h-px bg-[#722013]/10 flex-1 ml-2 hidden sm:block"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {mainCommittee.map((member, i) => (
              <div
                key={i}
                className="p-4 bg-[#FAF6F0] rounded-xl border border-[#E8DCC4] hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <p className="font-bold text-sm sm:text-base text-[#2a0b06] truncate">
                  {member.name}
                </p>
                <p className="text-xs font-medium text-stone-500 mt-1 uppercase tracking-wide">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* --- SUB-COMMITTEES SECTION --- */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <Users size={18} className="text-[#722013]" />
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#722013]">
              Sub-Committees
            </h3>
            <div className="h-px bg-[#722013]/10 flex-1 ml-2 hidden sm:block"></div>
          </div>
          
          <div className="flex flex-col gap-3">
            {subCommittees.map((sub, i) => (
              <div
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-stone-200 rounded-xl hover:border-amber-300 hover:bg-stone-50 transition-colors"
              >
                {/* Department Name */}
                <div className="font-semibold text-base text-[#2a0b06] sm:w-1/3">
                  {sub.title}
                </div>
                
                {/* Coordinator Name */}
                <div className="flex items-center gap-2 text-sm text-stone-600 sm:w-1/3">
                  <User size={14} className="text-amber-600 shrink-0" />
                  <span className="truncate">{sub.coord}</span>
                </div>
                
                {/* Contact Action */}
                <div className="sm:w-1/3 flex sm:justify-end">
                  <a
                    href={`tel:${sub.phone}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#FAF6F0] text-[#722013] text-sm font-bold rounded-lg border border-[#E8DCC4] hover:bg-[#722013] hover:text-white transition-colors w-full sm:w-auto justify-center"
                  >
                    <Phone size={14} /> 
                    <span>{sub.phone}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}