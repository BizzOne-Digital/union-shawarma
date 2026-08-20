// Groups consecutive days that share the same open/close time into a single row,
// e.g. [Mon,Tue,Wed: 11:30-9:00][Thu: 11:30-11:00] -> "Monday – Wednesday", "Thursday".
export const groupBusinessHours = (businessHours) => {
  if (!Array.isArray(businessHours) || businessHours.length === 0) return [];

  const groups = [];
  businessHours.forEach((h) => {
    const time = h.isClosed ? 'Closed' : `${h.open} – ${h.close}`;
    const last = groups[groups.length - 1];
    if (last && last.time === time) {
      last.days.push(h.day);
    } else {
      groups.push({ time, days: [h.day] });
    }
  });

  return groups.map((g) => ({
    day: g.days.length > 1 ? `${g.days[0]} – ${g.days[g.days.length - 1]}` : g.days[0],
    time: g.time,
  }));
};
