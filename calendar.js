export function createCalendar(ctx) {
  const { $, tasks, sortT, onDay, today, pad, MN, fmt, card } = ctx;
  let cal = new Date();
  let sel = today();
  function setSelection(day, monthDate) { sel = day; cal = monthDate; }
  function render() {
    const y = cal.getFullYear(), m = cal.getMonth();
    $('cm').textContent = MN[m] + ' ' + y;
    let html = ['S','M','T','W','T','F','S'].map(d => '<div class="h">' + d + '</div>').join('');
    const first = new Date(y, m, 1).getDay(), len = new Date(y, m + 1, 0).getDate();
    for (let i = 0; i < first; i++) html += '<button class="d x" aria-hidden="true"></button>';
    for (let d = 1; d <= len; d++) {
      const s = y + '-' + pad(m + 1) + '-' + pad(d);
      const dayTasks = tasks().filter(t => onDay(t, s));
      const dot = dayTasks.length ? (dayTasks.every(t => t.done) ? 'g' : 'r') : '';
      html += `<button class="d ${s === today() ? 'today' : ''} ${s === sel ? 'sel' : ''}" data-d="${s}">${d}${dot ? '<i class="' + dot + '"></i>' : ''}</button>`;
    }
    $('grid').innerHTML = html;
    const list = sortT(tasks().filter(t => onDay(t, sel)));
    $('dayT').textContent = (sel === today() ? 'Today · ' : '') + fmt(sel);
    $('dayL').innerHTML = list.length ? list.map(card).join('') : '<div class="empty">No tasks on this day.</div>';
  }
  $('cp').onclick = () => { cal = new Date(cal.getFullYear(), cal.getMonth() - 1, 1); render(); };
  $('cn').onclick = () => { cal = new Date(cal.getFullYear(), cal.getMonth() + 1, 1); render(); };
  return { render, select(day) { sel = day; render(); }, setSelection };
}
