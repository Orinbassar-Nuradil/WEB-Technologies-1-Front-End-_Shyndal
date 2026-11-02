/* COMPARISON ONLY — NOT LOADED BY ANY PAGE.
Original pre-jQuery main helper, catalogue, booking and password features from supplied shindal.zip.
Preserved verbatim below to compare with main.js, services.js, booking.js and account.js. */

// ORIGINAL FILE: main.js
'use strict';
window.Shindal = (() => {
  const services = window.ShindalData;
  const demo = 'Front-end demonstration only. No data is sent to a server; no real booking, payment, order or account is created.';
  const el = (tag, text = '', classes = '') => {
    const node = document.createElement(tag); node.textContent = text;
    if (classes) node.className = classes; return node;
  };
  const byId = id => document.getElementById(id);
  const money = amount => `${new Intl.NumberFormat('en-KZ').format(amount)} ₸`;
  const findService = id => services.find(service => service.id === id);
  const total = rows => rows.reduce((sum, row) => sum + (findService(row.id)?.price || 0) * row.quantity, 0);
  const reference = () => `DEMO-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`;
  const read = (key, fallback) => { try { return JSON.parse(sessionStorage.getItem(`shindal-${key}`)) || fallback; } catch { return fallback; } };
  const save = (key, value) => { try { sessionStorage.setItem(`shindal-${key}`, JSON.stringify(value)); return true; } catch { return false; } };
  const message = (node, text) => { node.textContent = text; node.classList.remove('hidden'); node.setAttribute('role', 'status'); node.setAttribute('aria-live', 'polite'); };
  const button = (text, action) => { const node = el('button', text, 'btn btn-outline-brand btn-sm'); node.type = 'button'; node.addEventListener('click', action); return node; };
  const field = (parent, id, label, type = 'text') => {
    const wrap = el('div', '', 'mb-3'); const caption = el('label', label, 'form-label'); caption.htmlFor = id;
    const input = el('input', '', 'form-control'); input.id = id; input.type = type; wrap.append(caption, input); parent.append(wrap); return input;
  };
  const select = (parent, id, label, options) => {
    const input = field(parent, id, label); const node = el('select', '', 'form-select'); node.id = id;
    options.forEach(([value, text]) => { const option = el('option', text); option.value = value; node.append(option); }); input.replaceWith(node); return node;
  };
  const render = (parent, items, make, empty = 'No matches. Change your filters or reset.') => {
    parent.replaceChildren(); if (items.length === 0) parent.append(el('p', empty, 'col-12')); else items.forEach(item => parent.append(make(item)));
  };
  const email = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const phone = value => /^(?:\+7|8)\d{10}$/.test(value.replace(/[\s()-]/g, ''));
  const strong = value => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);
  const validate = (form, rules, success) => {
    const clear = input => { byId(`${input.id}-error`)?.remove(); input.classList.remove('error', 'success'); input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); };
    form.addEventListener('input', event => { if (event.target.id) clear(event.target); form.parentElement.querySelectorAll('[id$="-confirmation"]').forEach(node => node.classList.add('hidden')); });
    form.addEventListener('change', event => { if (event.target.id) clear(event.target); form.parentElement.querySelectorAll('[id$="-confirmation"]').forEach(node => node.classList.add('hidden')); });
    form.addEventListener('reset', () => { Array.from(form.elements).forEach(clear); form.parentElement.querySelectorAll('[id$="-confirmation"]').forEach(node => node.classList.add('hidden')); });
    form.addEventListener('submit', event => {
      event.preventDefault(); form.parentElement.querySelectorAll('[id$="-confirmation"]').forEach(node => node.classList.add('hidden')); let first = null;
      Object.entries(rules()).forEach(([id, error]) => {
        const input = byId(id); clear(input); input.classList.add(error ? 'error' : 'success'); input.setAttribute('aria-invalid', String(Boolean(error)));
        if (error) { const note = el('p', error, 'error-message'); note.id = `${id}-error`; input.after(note); input.setAttribute('aria-describedby', note.id); first ||= input; }
      });
      if (first) first.focus(); else success();
    });
  };
  byId('main')?.prepend(el('p', demo, 'small text-muted mb-3'));
  byId('primary-nav')?.addEventListener('click', event => {
    if (window.bootstrap) return; const toggle = event.target.closest('[data-bs-toggle]'); if (!toggle) return;
    const target = toggle.dataset.bsToggle === 'dropdown' ? toggle.nextElementSibling : document.querySelector(toggle.dataset.bsTarget);
    target?.classList.toggle('show'); toggle.setAttribute('aria-expanded', String(target?.classList.contains('show')));
  });
  const searchForm = el('form', '', 'd-flex flex-wrap gap-2 mb-3'); const search = field(searchForm, 'site-search', 'Find a service');
  const submit = el('button', 'Search services', 'btn btn-outline-brand'); submit.type = 'submit'; searchForm.append(submit);
  byId('site-footer')?.querySelector('.container')?.prepend(searchForm);
  searchForm.addEventListener('submit', event => { event.preventDefault(); window.location.href = `services.html?q=${encodeURIComponent(search.value.trim())}`; });
  return { services, demo, el, byId, money, findService, total, reference, read, save, message, button, field, select, render, email, phone, strong, validate };
})();


// ORIGINAL FILE: services.js
'use strict';
(() => {
  const S = window.Shindal; const grid = document.querySelector('#main > .row');
  const controls = S.el('section', '', 'soft-card p-3 mb-4'); grid.before(controls);
  const search = S.field(controls, 'service-search', 'Search services'); search.value = new URLSearchParams(location.search).get('q') || '';
  const category = S.select(controls, 'category', 'Category', [['', 'All categories'], ['Development','Development'], ['Consultation','Consultation']]);
  const sort = S.select(controls, 'sort', 'Sort', [['name','Name'],['price','Price: low to high']]);
  const count = S.el('p'); count.setAttribute('aria-live','polite'); controls.append(count);
  const update = () => {
    const matches = S.services.filter(item => (category.value === '' || item.category === category.value) && `${item.name} ${item.description}`.toLowerCase().includes(search.value.trim().toLowerCase()));
    matches.sort((a,b) => sort.value === 'price' ? a.price-b.price : a.name.localeCompare(b.name)); count.textContent = `${matches.length} services found`;
    S.render(grid, matches, item => {
      const col = S.el('div','','col'); col.id = item.id; const card = S.el('article','','card h-100 soft-card');
      const image = S.el('img','','card-img-top'); image.src=item.image; image.alt=item.name;
      const body=S.el('div','','card-body'); body.append(S.el('h2',item.name,'h5'),S.el('p',item.description),S.el('p',`${item.minutes} min · ${S.money(item.price)}`));
      const link=S.el('a','Book this service','btn btn-brand btn-sm'); link.href=`booking.html?service=${item.id}`;
      const foot=S.el('div','','card-footer bg-transparent'); foot.append(link,S.button('Add to estimate',()=>add(item.id))); card.append(image,body,foot); col.append(card); return col;
    });
  };
  controls.append(S.button('Reset filters',()=>{search.value='';category.value='';sort.value='name';update();}));
  [search, category, sort].forEach(input=>input.addEventListener('input',update));
  const panel=S.el('section','','soft-card p-4 mb-4'); grid.after(panel); panel.append(S.el('h2','Session estimate','h4'),S.el('p','Planning estimate only. Sessions are individual; actual scheduling is agreed directly with the center.'));
  const list=S.el('div'); const amount=S.el('p'); amount.setAttribute('aria-live','polite'); const status=S.el('p'); status.setAttribute('aria-live','polite');
  let cart=S.read('cart',[]).filter(row=>S.findService(row.id) && Number.isInteger(row.quantity) && row.quantity>0 && row.quantity<=20);
  const checkout=S.button('Demonstrate estimate',()=>S.message(status,`${S.reference()}: ${cart.map(row=>`${S.findService(row.id).name} × ${row.quantity}`).join('; ')}. Total ${S.money(S.total(cart))}. ${S.demo}`));
  const draw=()=>{
    S.save('cart',cart); status.textContent='';
    S.render(list,cart,row=>{
      const item=S.findService(row.id); const line=S.el('div','','d-flex flex-wrap gap-2 align-items-center mb-3');
      line.append(S.el('span',`${item.name}: ${row.quantity} × ${S.money(item.price)} = ${S.money(item.price*row.quantity)}`),S.button(`− ${item.name}`,()=>change(row.id,-1)),S.button(`+ ${item.name}`,()=>change(row.id,1)),S.button(`Remove ${item.name}`,()=>{cart=cart.filter(value=>value.id!==row.id);draw();})); return line;
    },'Your estimate is empty. Add a service above.');
    amount.textContent=`${cart.reduce((sum,row)=>sum+row.quantity,0)} sessions · Total ${S.money(S.total(cart))}`; checkout.disabled=cart.length===0;
  };
  const change=(id,delta)=>{const row=cart.find(item=>item.id===id);if(row.quantity+delta>20){S.message(status,'Maximum 20 sessions per service.');return;}row.quantity+=delta;cart=cart.filter(item=>item.quantity>0);draw();};
  const add=id=>{const row=cart.find(item=>item.id===id);if(row){change(id,1);}else{cart.push({id,quantity:1});draw();} S.message(status,`${S.findService(id).name}: review your estimate below.`);};
  panel.append(list,amount,checkout,S.button('Clear estimate',()=>{cart=[];draw();S.message(status,'Estimate cleared.');}),status); update();draw();
})();


// ORIGINAL FILE: booking.js
'use strict';
(() => {
  const S=window.Shindal; const form=S.byId('booking-form'); const value=id=>S.byId(id).value.trim();
  const service=S.byId('service'); const specialist=S.byId('specialist'); const date=S.byId('visit-date'); const time=S.byId('visit-time');
  const quantity=S.field(form.querySelector('.row'),'sessions','Number of individual sessions (1–20)','number'); quantity.min='1';quantity.max='20';quantity.value='1';quantity.defaultValue='1';
  const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Almaty',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  date.min=today();
  Array.from(time.options).forEach(option=>{option.textContent={morning:'09:00–09:40',afternoon:'15:00–15:40',evening:'17:00–17:40'}[option.value];});
  const summary=S.el('p','','mt-3'); summary.setAttribute('aria-live','polite'); S.byId('booking-price').parentElement.after(summary);
  const note=form.querySelector('.small.text-muted'); note.textContent=S.demo;
  document.querySelectorAll('#main .steps li').forEach((node,index)=>{node.textContent=['Review your demo summary','Contact the center directly for a real request','Agree on the actual date, specialist and price','Visit only after the center confirms'][index];});
  const selected=new URLSearchParams(location.search).get('service');if(S.findService(selected)) service.value=selected;
  const choose=()=>{
    const item=S.findService(service.value); specialist.replaceChildren();
    [['any','Any suitable specialist'],...(item?.specialists || []).map(name=>[name,name])].forEach(([id,name])=>{const option=S.el('option',name);option.value=id;specialist.append(option);});
  };
  const update=()=>{
    const item=S.findService(service.value);const n=Number(quantity.value);summary.classList.remove('hidden');
    S.byId('booking-price').textContent=item && Number.isInteger(n) && n>=1 && n<=20 ? S.money(item.price*n) : 'Choose a service and 1–20 sessions';
    summary.textContent=`${item?.name || 'No service'} · ${value('branch')} · ${date.value || 'Choose a date'} · ${time.selectedOptions[0]?.textContent.trim()} · ${quantity.value || '0'} individual sessions${S.byId('first-visit').checked ? ' · First visit: diagnostic assessment; final price must be confirmed directly.' : ''}. Multiple sessions require separate dates agreed with the center.`;
  };
  choose();update();service.addEventListener('change',()=>{choose();update();});form.addEventListener('input',update);form.addEventListener('change',update);
  form.addEventListener('reset',()=>setTimeout(()=>{choose();update();},0));
  const rules=()=>{
    const item=S.findService(service.value);const n=Number(quantity.value);const age=Number(value('child-age'));
    const visit=new Date(`${date.value}T${time.value==='morning'?'09':time.value==='afternoon'?'15':'17'}:00:00+05:00`);
    const duplicate=S.read('bookings',[]).some(row=>row.date===date.value && row.time===time.value && row.branch===value('branch') && row.specialist===specialist.value);
    return {
      'child-name':value('child-name').length>=2?'':'Enter the child’s name (at least 2 characters).',
      'parent-name':value('parent-name').length>=2?'':'Enter the parent’s name (at least 2 characters).',
      phone:S.phone(value('phone'))?'':'Use a Kazakhstan phone number: +7 and 10 digits.',
      email:!value('email') || S.email(value('email'))?'':'Enter a valid email address.',
      'child-age':Number.isInteger(age) && age>=1 && age<=18?'':'Enter a whole age from 1 to 18.',
      branch:['astana','kosshy','taraz'].includes(value('branch'))?'':'Choose a branch.',
      service:item?'':'Choose a service.',
      specialist:specialist.value==='any' || item?.specialists.includes(specialist.value)?'':'Choose a specialist matching the service.',
      'visit-date':date.value>=today() && !Number.isNaN(visit.getTime()) && visit>new Date() && visit.getUTCDay()!==0?'':'Choose a future date and time (Kazakhstan time). Sunday is closed; Saturday is by appointment only.',
      'visit-time':duplicate?'A demo request already exists for this branch, date, period and specialist. Choose another period.':'',
      sessions:Number.isInteger(n) && n>=1 && n<=20?'':'Choose 1–20 individual sessions.',
      comment:value('comment').length<=1000?'':'Use at most 1000 characters.',
      consent:S.byId('consent').checked?'':'Please agree before continuing.'
    };
  };
  S.validate(form,rules,()=>{
    const item=S.findService(service.value);const ref=S.reference();
    const row={reference:ref,date:date.value,time:time.value,branch:value('branch'),specialist:specialist.value,service:item.name,quantity:Number(quantity.value),total:item.price*Number(quantity.value)};
    const rows=S.read('bookings',[]);rows.push(row);const stored=S.save('bookings',rows);
    S.message(S.byId('booking-confirmation'),`${ref}. ${summary.textContent} Estimate ${S.money(row.total)}. ${stored?'Demo summary saved in this tab; manage it in My Profile.':'Browser storage is unavailable; keep this summary yourself.'} ${S.demo}`);
  });
})();


// ORIGINAL FILE: register.js
'use strict';
(() => {
  const S=window.Shindal;const form=S.byId('register-form');const value=id=>S.byId(id).value.trim();
  form.querySelector('.small.text-muted').textContent='Validate your details locally. No account will be created; no password is saved.';
  const password=S.byId('reg-password');const confirm=S.byId('reg-password-confirm');
  const checklist=S.el('ul','','small');password.after(checklist);
  const update=()=>S.render(checklist,[[/.{8,}/,'8 characters'],[/[A-Z]/,'Uppercase letter'],[/[a-z]/,'Lowercase letter'],[/\d/,'Number'],[/[^A-Za-z0-9]/,'Special character']],([pattern,label])=>S.el('li',`${pattern.test(password.value)?'✓':'○'} ${label}`));
  password.addEventListener('input',()=>{update();S.byId('reg-password-confirm-error')?.remove();confirm.classList.remove('error','success');confirm.removeAttribute('aria-invalid');}); update();form.addEventListener('reset',()=>setTimeout(update,0));
  [password,confirm].forEach(input=>{ input.removeAttribute('name'); const toggle=S.button('Show password',()=>{input.type=input.type==='password'?'text':'password';toggle.textContent=input.type==='text'?'Hide password':'Show password';toggle.setAttribute('aria-pressed',String(input.type==='text'));});toggle.setAttribute('aria-controls',input.id);toggle.setAttribute('aria-pressed','false');input.after(toggle); });
  const file=S.byId('reg-photo');const preview=S.el('img','','img-fluid rounded-3');preview.alt='Selected avatar preview';file.after(preview);let url=null;
  file.addEventListener('change',()=>{if(url)URL.revokeObjectURL(url);const photo=file.files[0];if(photo && ['image/jpeg','image/png','image/webp'].includes(photo.type) && photo.size<=2*1024*1024){url=URL.createObjectURL(photo);preview.src=url;}else preview.removeAttribute('src');});
  form.addEventListener('reset',()=>{preview.removeAttribute('src');if(url)URL.revokeObjectURL(url);[password,confirm].forEach(input=>{input.type='password';input.nextElementSibling.textContent='Show password';input.nextElementSibling.setAttribute('aria-pressed','false');});});
  S.validate(form,()=>({
    'reg-name':value('reg-name').length>=2?'':'Enter your name (at least 2 characters).',
    'reg-email':S.email(value('reg-email'))?'':'Enter a valid email.',
    'reg-phone':S.phone(value('reg-phone'))?'':'Enter +7 and 10 digits.',
    'reg-branch':['astana','kosshy','taraz'].includes(value('reg-branch'))?'':'Choose a branch.',
    'reg-photo':!file.files[0] || (['image/jpeg','image/png','image/webp'].includes(file.files[0].type) && file.files[0].size<=2*1024*1024)?'':'Choose JPG, PNG or WebP up to 2 MB.',
    'reg-password':S.strong(password.value)?'':'Use 8+ characters, uppercase, lowercase, number and special character.',
    'reg-password-confirm':confirm.value===password.value && confirm.value!==''?'':'Passwords must match exactly.'
  }),()=>{
    const profile={name:value('reg-name'),email:value('reg-email'),phone:value('reg-phone'),branch:value('reg-branch')};const stored=S.save('profile',profile);
    password.value='';confirm.value='';update();S.message(S.byId('register-confirmation'),`${profile.name}, validation passed for ${profile.email}, ${profile.phone}, ${profile.branch}. ${stored?'Non-password demo details are available in My Profile in this tab.':'Storage unavailable; details are not saved.'} ${S.demo}`);
  });
})();
