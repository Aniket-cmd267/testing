(function(){
  const listEl = document.getElementById('list');
  const input = document.getElementById('taskInput');
  const addBtn = document.getElementById('addBtn');
  const countLine = document.getElementById('countLine');
  const clearDoneBtn = document.getElementById('clearDone');
  const dateLine = document.getElementById('dateLine');
  const filterBtns = document.querySelectorAll('.filter-btn');

  let todos = [];
  let filter = 'all';
  const STORAGE_KEY = 'ledger-todos';

  dateLine.textContent = new Date().toLocaleDateString(undefined, {
    weekday:'long', year:'numeric', month:'long', day:'numeric'
  });

  function uid(){
    return Date.now().toString(36) + Math.random().toString(36).slice(2,7);
  }

  function loadTodos(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      todos = raw ? JSON.parse(raw) : [];
    }catch(e){
      todos = [];
    }
    render();
  }

  function saveTodos(){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    }catch(e){
      console.error('Could not save', e);
    }
  }

  function addTodo(text){
    text = text.trim();
    if(!text) return;
    todos.unshift({ id: uid(), text, done:false, createdAt: Date.now() });
    saveTodos();
    render();
  }

  function toggleTodo(id){
    const t = todos.find(t=>t.id===id);
    if(t) t.done = !t.done;
    saveTodos();
    render();
  }

  function deleteTodo(id){
    todos = todos.filter(t=>t.id!==id);
    saveTodos();
    render();
  }

  function clearDone(){
    todos = todos.filter(t=>!t.done);
    saveTodos();
    render();
  }

  function visibleTodos(){
    if(filter==='active') return todos.filter(t=>!t.done);
    if(filter==='done') return todos.filter(t=>t.done);
    return todos;
  }

  function render(){
    const visible = visibleTodos();
    listEl.innerHTML = '';

    if(todos.length === 0){
      listEl.innerHTML = '<li class="empty">The page is blank. Write down the first thing you need to do.</li>';
    } else if(visible.length === 0){
      listEl.innerHTML = `<li class="empty">Nothing filed under "${filter === 'active' ? 'Open' : 'Settled'}".</li>`;
    } else {
      visible.forEach((t, i) => {
        const li = document.createElement('li');
        li.className = 'task';
        li.innerHTML = `
          <span class="idx">${String(i+1).padStart(2,'0')}</span>
          <span class="checkbox ${t.done ? 'done' : ''}" data-id="${t.id}" role="checkbox" aria-checked="${t.done}" tabindex="0"></span>
          <span class="task-text ${t.done ? 'done' : ''}">${escapeHtml(t.text)}</span>
          <span class="stamp ${t.done ? 'show' : ''}">Settled</span>
          <button class="del" data-id="${t.id}" aria-label="Delete task" title="Delete">×</button>
        `;
        listEl.appendChild(li);
      });
    }

    const remaining = todos.filter(t=>!t.done).length;
    countLine.textContent = todos.length === 0
      ? '0 entries'
      : `${remaining} open · ${todos.length - remaining} settled · ${todos.length} total`;
  }

  function escapeHtml(str){
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  addBtn.addEventListener('click', () => {
    addTodo(input.value);
    input.value = '';
    input.focus();
  });

  input.addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){
      addTodo(input.value);
      input.value = '';
    }
  });

  listEl.addEventListener('click', (e) => {
    const cb = e.target.closest('.checkbox');
    if(cb){ toggleTodo(cb.dataset.id); return; }
    const del = e.target.closest('.del');
    if(del){ deleteTodo(del.dataset.id); return; }
  });

  listEl.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' || e.key === ' '){
      const cb = e.target.closest('.checkbox');
      if(cb){ e.preventDefault(); toggleTodo(cb.dataset.id); }
    }
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      filter = btn.dataset.filter;
      render();
    });
  });

  clearDoneBtn.addEventListener('click', clearDone);

  loadTodos();
})();