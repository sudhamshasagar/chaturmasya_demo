export const START_DATE = new Date(2026, 6, 29); // July 29, 2026
export const END_DATE = new Date(2026, 8, 26);   // Sept 26, 2026

export const generateTimeSlots = (duration) => {
  switch (duration) {
    case "30 mins":
      return ["05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM", "07:15 PM"];
    case "45 mins":
      return ["05:30 PM", "06:15 PM", "07:00 PM"];
    case "1 hr":
      return ["05:30 PM", "06:30 PM"];
    default:
      return [];
  }
};

// Ensures time is zeroed out for accurate Firestore equality checks
export const normalizeDate = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};