export function initTaskSetup(ctx) {
  const { $, db, doc, setDoc, today, parse, show, setSelection } = ctx;
  $('start').value = today();
  $('save').onclick = async () => {
    const name = $('name').value.trim();
    const start = $('start').value;
    const end = $('end').value || start;
    if (!name) { $('err').textContent = 'Please enter a task name.'; return; }
    if (!start) { $('err').textContent = 'Please pick a start date.'; return; }
    if (end < start) { $('err').textContent = 'The end date can’t be before the start date.'; return; }
    if (!ctx.uid) { $('err').textContent = 'Please log in before saving a task.'; return; }
    try {
      await setDoc(doc(db, 'users', ctx.uid, 'tasks', String(Date.now())), {
        name, start, end, time: $('time').value, note: $('note').value.trim(), done: false
      });
      $('err').textContent = '';
      ['name', 'end', 'time', 'note'].forEach(id => $(id).value = '');
      $('start').value = today();
      setSelection(start, parse(start));
      show('cal');
    } catch (e) {
      $('err').textContent = 'Could not save the task. Check your connection and permissions.';
    }
  };
}
