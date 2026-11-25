export function createMonthTasks(ctx) {
  const { $, tasks, sortT, MN, pad, card } = ctx;
  let mon = new Date();
  function render() {
    const y = mon.getFullYear(), m = mon.getMonth();
    $('mm').textContent = MN[m] + ' ' + y;
    const first = y + '-' + pad(m + 1) + '-01';
    const last = y + '-' + pad(m + 1) + '-' + pad(new Date(y, m + 1, 0).getDate());
    const list = sortT(tasks().filter(t => t.start <= last && t.end >= first)).sort((a,b) => a.start.localeCompare(b.start));
    $('monL').innerHTML = list.length ? list.map(card).join('') : '<div class="empty">No tasks this month.</div>';
  }
  $('mp').onclick = () => { mon = new Date(mon.getFullYear(), mon.getMonth() - 1, 1); render(); };
  $('mn').onclick = () => { mon = new Date(mon.getFullYear(), mon.getMonth() + 1, 1); render(); };
  return { render, setMonth(date) { mon = date; render(); } };
}
