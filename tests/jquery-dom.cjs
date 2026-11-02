const {JSDOM, VirtualConsole}=require('jsdom');
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname, '..');
const jquery=fs.readFileSync(path.join(__dirname, 'fixtures/jquery-3.7.1.min.js'),'utf8');
const passed=[];
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function page(name, query='', stored={}) {
  const errors=[];const vc=new VirtualConsole();vc.on('jsdomError',error=>errors.push(error.message));
  const dom=new JSDOM(fs.readFileSync(path.join(root,name+'.html'),'utf8'),{url:'https://shindal.test/'+name+'.html'+query,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:vc});
  const w=dom.window;w.URL.createObjectURL=()=> 'blob:demo';w.URL.revokeObjectURL=()=>{};
  for(const [key,value] of Object.entries(stored))w.sessionStorage.setItem('shindal-'+key,JSON.stringify(value));
  w.eval(jquery);w.$.fx.off=true;
  for(const file of [...w.document.querySelectorAll('script[src^="js/"]')].map(node=>node.getAttribute('src')))w.eval(fs.readFileSync(path.join(root,file),'utf8'));
  await new Promise(resolve=>w.$(resolve));await pause(15);
  return {dom,w,$:w.$,errors};
}
function check(p, label) {assert.deepEqual(p.errors,[],label+' uncaught errors');passed.push(label);}
function fill($, values) {for(const [id,value] of Object.entries(values))$('#'+id).val(value).trigger('input');}
async function run(){
  for(const name of ['index','about','services','specialists','help','reviews','booking','register','login','profile']){
    const p=await page(name);assert.equal(p.$('#site-search').length,1);assert.equal(p.w.$.fn.jquery,'3.7.1');check(p,'initial load '+name);p.dom.window.close();
  }
  {
    const p=await page('services'),{$}=p;
    assert.equal($('#services-grid [data-service]').length,8);
    $('#service-search').val('zzzz').trigger('input');assert.match($('#service-count').text(),/^0/);assert.match($('#services-grid').text(),/No matching/);
    $('#main button').filter((i,node)=>$(node).text()==='Reset filters').trigger('click');
    $('#sort').val('price').trigger('change');assert.equal($('#services-grid [data-service]').first().attr('data-service'),'afe');
    $('#category').val('Consultation').trigger('change');assert.equal($('#services-grid [data-service]').length,1);
    $('#service-search').val('speech').trigger('input');assert.equal($('#services-grid [data-service]').length,0);
    $('#main button').filter((i,node)=>$(node).text()==='Reset filters').trigger('click');
    // These buttons were destroyed/rebuilt by filters. Delegation must still catch them.
    $('[data-add-service="speech"]').trigger('click').trigger('click');$('[data-add-service="neurology"]').trigger('click');
    assert.match($('#estimate-total').text(),/24.?000/);$('#estimate-checkout').trigger('click');assert.match($('#estimate-confirmation').text(),/DEMO-/);
    $('[data-line="speech"] [data-cart-action="decrease"]').trigger('click');assert.match($('#estimate-total').text(),/17.?000/);
    $('[data-line="speech"] [data-cart-action="remove"]').trigger('click');assert.match($('#estimate-total').text(),/10.?000/);
    $('#estimate-panel button').filter((i,node)=>$(node).text()==='Clear estimate').trigger('click');assert.equal($('#estimate-checkout').prop('disabled'),true);
    check(p,'catalogue filters, regenerated delegated buttons, cart totals, remove and clear');p.dom.window.close();
  }
  let saved;
  {
    const p=await page('booking','?service=speech'),{$}=p;
    assert.equal($('#service').val(),'speech');assert.equal($('#specialist option').length,4);
    $('#booking-form').trigger('submit');assert($('#booking-form .error-message').length>=5);assert.equal(p.w.document.activeElement.id,'child-name');
    $('#child-name').val(' ').trigger('input');assert.equal($('#child-name').hasClass('error'),true);
    $('#child-name').val('Test child').trigger('input');assert.equal($('#child-name').hasClass('error'),false);
    fill($,{'parent-name':' Demo Parent ',phone:'+7 701 234 56 78',email:'bad','child-age':'7','visit-date':'2099-01-07',sessions:'2'}); // Wednesday
    $('#consent').prop('checked',true).trigger('change');$('#booking-form').trigger('submit');assert.equal($('#email').hasClass('error'),true);
    $('#email').val('demo@example.com').trigger('input');assert.equal($('#email').hasClass('error'),false);
    $('#booking-form').trigger('submit');assert.equal($('#booking-confirmation').hasClass('hidden'),false);assert.match($('#booking-confirmation').text(),/14.?000/);assert.equal($('#child-name').val(),'');assert.equal($('#sessions').val(),'1');
    saved=JSON.parse(p.w.sessionStorage.getItem('shindal-bookings'));assert.equal(saved[0].quantity,2);assert.equal(saved[0].total,14000);
    fill($,{'child-name':'Child','parent-name':'Parent',phone:'+77011234567','child-age':'7','visit-date':'2099-01-07'});$('#service').val('speech').trigger('change');$('#consent').prop('checked',true).trigger('change');$('#booking-form').trigger('submit');assert.match($('#visit-time-error').text(),/conflicts/);
    $('#visit-date').val('2000-01-01').trigger('input');$('#booking-form').trigger('submit');assert.equal($('#visit-date').hasClass('error'),true);
    $('#visit-date').val('2099-01-04').trigger('input');$('#booking-form').trigger('submit');assert.equal($('#visit-date').hasClass('error'),true); // Sunday
    check(p,'booking field errors, live correction, total, success reset, duplicate and invalid dates');p.dom.window.close();
  }
  let profile;
  {
    const p=await page('register'),{$}=p;
    fill($,{'reg-name':' Demo Parent ','reg-email':'demo@example.com','reg-phone':'+77011234567','reg-password':'DemoPass1!','reg-password-confirm':'different'});
    $('[data-password-for="reg-password"]').trigger('click');assert.equal($('#reg-password').attr('type'),'text');assert.equal($('[data-password-for="reg-password"]').attr('aria-pressed'),'true');
    $('[data-password-for="reg-password"]').trigger('click');assert.equal($('#reg-password').attr('type'),'password');
    $('#register-form').trigger('submit');assert.equal($('#reg-password-confirm').hasClass('error'),true);
    $('#reg-password-confirm').val('DemoPass1!').trigger('input');assert.equal($('#reg-password-confirm').hasClass('error'),false);
    $('#register-form').trigger('submit');assert.equal($('#register-confirmation').hasClass('hidden'),false);assert.equal($('#reg-password').val(),'');
    profile=JSON.parse(p.w.sessionStorage.getItem('shindal-profile'));assert.equal(profile.name,'Demo Parent');assert(!JSON.stringify(profile).includes('DemoPass'));assert.equal($('#reg-password').attr('name'),undefined);
    check(p,'password show/hide, exact comparison, live correction, success reset and no stored passwords');p.dom.window.close();
  }
  {
    const p=await page('login'),{$}=p;fill($,{'login-email':'demo@example.com','login-password':'DemoPass1!'});$('#login-form').trigger('submit');assert.match($('#login-confirmation').text(),/No user was authenticated/);assert.equal($('#login-password').val(),'');check(p,'login demo-only reset');p.dom.window.close();
  }
  {
    const p=await page('reviews'),{$}=p;$('#review-filter').val('local').trigger('change');assert.match($('#reviews-list').text(),/No local/);
    const unsafe='<img src=x onerror=alert(1)> Local demonstration review text.';
    fill($,{'review-name':'<b>Demo</b>','review-text':unsafe});$('#review-form').trigger('submit');assert.equal($('#review-name').val(),'');assert.equal($('#reviews-list img').length,0);assert.match($('#reviews-list').text(),/onerror/);assert.equal($('#reviews-list b').length,0);
    $('[data-remove-review]').trigger('click');assert.match($('#reviews-list').text(),/No local/);check(p,'safe user text, local review create, delegated animated removal and empty state');p.dom.window.close();
  }
  {
    const p=await page('help'),{$}=p;$('#faq-search').val('zzzz').trigger('input');assert.equal($('#faq-list .accordion-item:not(.hidden)').length,0);
    $('#faq-search').val('').trigger('input');const $button=$('#faq-list .accordion-button').first(),$panel=$button.closest('.accordion-item').find('.accordion-collapse');
    $button.trigger('click');assert.equal($panel.hasClass('show'),false);assert.equal($button.prop('disabled'),false);$button.trigger('click');assert.equal($panel.hasClass('show'),true);
    $('#tab-taraz').trigger('click');assert.equal($('#map-taraz').hasClass('active'),true);
    fill($,{'question-name':'Demo','question-contact':'demo@example.com','question-text':'This question has at least twenty characters.'});$('#question-form').trigger('submit');assert.equal($('#question-confirmation').hasClass('hidden'),false);assert.equal($('#question-text').val(),'');
    check(p,'FAQ filtering, slide callbacks, map fallback and question reset');p.dom.window.close();
  }
  {
    const p=await page('profile','',{profile,bookings:saved}),{$}=p;assert.equal($('#profile-name').text(),'Demo Parent');assert.equal($('[data-remove-request]').length,1);
    $('#profile-edit').trigger('click');$('#edit-name').val('Updated Parent').trigger('input');$('#profile-editor').trigger('submit');assert.equal($('#profile-name').text(),'Updated Parent');
    $('[data-remove-request]').trigger('click');assert.match($('#booking-history-body').text(),/No demo requests/);
    $('#profile-logout').trigger('click');assert.equal($('#profile-name').text(),'No demo details saved');check(p,'profile edit, remove request, clear data and empty state');p.dom.window.close();
  }
  {
    const p=await page('specialists'),{$}=p;$('#specialist-search').val('zzzz').trigger('input');assert.match($('#specialist-count').text(),/^0/);check(p,'specialist search');p.dom.window.close();
  }
  {
    const p=await page('help'),{$}=p;$.fx.off=false;
    const $button=$('#faq-list .accordion-button').first();
    const $panel=$button.closest('.accordion-item').find('.accordion-collapse');
    $button.trigger('click');assert.equal($button.prop('disabled'),true);await pause(300);
    assert.equal($button.prop('disabled'),false);assert.equal($panel.hasClass('show'),false);
    p.w.Shindal.message($('#question-confirmation'),'Effect callback smoke test');await pause(300);
    assert.equal(p.w.document.activeElement.id,'question-confirmation');
    check(p,'effects enabled: timed completion callbacks restore controls and focus feedback');p.dom.window.close();
  }
  console.log(passed.map(label=>'PASS '+label).join('\n'));console.log('TOTAL '+passed.length+' passing scenarios; jsdom DOM tests, not a visual browser test.');
}
run().catch(e=>{console.error(e);process.exitCode=1});
