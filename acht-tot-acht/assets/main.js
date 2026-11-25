(function(){
  var d=document, w=window, rm=w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.documentElement.classList.add('js');
  function $(s,c){return (c||d).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))}

  /* Header-schaduw */
  var kop=$('.kop');
  if(kop){var sh=function(){kop.classList.toggle('schaduw',w.scrollY>8)};sh();w.addEventListener('scroll',sh,{passive:true})}

  /* Menu */
  var hb=$('#hamburger'), pn=$('#paneel');
  if(hb&&pn){
    var zet=function(o){pn.classList.toggle('open',o);hb.setAttribute('aria-expanded',o?'true':'false');hb.setAttribute('aria-label',o?'Menu sluiten':'Menu openen')};
    hb.addEventListener('click',function(e){e.stopPropagation();zet(!pn.classList.contains('open'))});
    $$('a',pn).forEach(function(a){a.addEventListener('click',function(){zet(false)})});
    d.addEventListener('click',function(e){if(pn.classList.contains('open')&&!pn.contains(e.target))zet(false)});
    d.addEventListener('keydown',function(e){if(e.key==='Escape'&&pn.classList.contains('open')){zet(false);hb.focus()}});
  }

  /* Reveal: alleen koppen en tekstblokken, nooit kaarten. Vangnet: na 4 s is alles zichtbaar. */
  var rv=$$('.reveal');
  if(rv.length){
    if(rm||!('IntersectionObserver' in w)){rv.forEach(function(el){el.classList.add('zicht')})}
    else{
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('zicht');io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px'});
      rv.forEach(function(el){io.observe(el)});
      setTimeout(function(){rv.forEach(function(el){el.classList.add('zicht')})},4000);
    }
  }

  /* Parallax: gedraaide vierkanten en de foto in de wijzerring. Alleen transform, maximaal 30px. Nooit kaarten. */
  var px=$$('[data-px]');
  if(px.length&&!rm){
    var tik=false;
    var doe=function(){px.forEach(function(el){var r=el.getBoundingClientRect();var m=(r.top+r.height/2-w.innerHeight/2);var f=parseFloat(el.getAttribute('data-px'));var y=Math.max(-30,Math.min(30,-m*f));el.style.transform=(el.classList.contains('deco')?'rotate(45deg) ':'')+'translateY('+y.toFixed(1)+'px)'});tik=false};
    w.addEventListener('scroll',function(){if(!tik){tik=true;requestAnimationFrame(doe)}},{passive:true});doe();
  }

  /* Tellers: de echte waarde staat in de HTML. Pas bij de start op de beginwaarde, na 1,5 s altijd de eindwaarde. */
  var tl=$$('[data-tel]');
  if(tl.length&&!rm&&('IntersectionObserver' in w)){
    var start=function(el){var doel=parseFloat(el.getAttribute('data-tel'));var van=parseFloat(el.getAttribute('data-van')||'0');var t0=Date.now();el.textContent=String(Math.round(van));
      var stap=function(){var p=Math.min(1,(Date.now()-t0)/1200);el.textContent=String(Math.round(van+(doel-van)*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(stap)};
      requestAnimationFrame(stap);setTimeout(function(){el.textContent=String(doel)},1500)};
    var it=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){start(e.target);it.unobserve(e.target)}})},{threshold:.3});
    tl.forEach(function(el){it.observe(el)});
  }

  /* Tijdbalk en weekrooster: tijd in Nederland. Openingstijden volgens Google: ma t/m vr 08-20, za 08-17, zo gesloten. */
  var TIJD={0:null,1:[8,20],2:[8,20],3:[8,20],4:[8,20],5:[8,20],6:[8,17]};
  var nl=function(){try{var p=new Intl.DateTimeFormat('en-GB',{timeZone:'Europe/Amsterdam',weekday:'short',hour:'2-digit',minute:'2-digit',hour12:false}).formatToParts(new Date());var o={};p.forEach(function(x){o[x.type]=x.value});return {dag:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(o.weekday),u:parseInt(o.hour,10)%24,m:parseInt(o.minute,10)}}catch(e){var n=new Date();return {dag:n.getDay(),u:n.getHours(),m:n.getMinutes()}}};
  var nu=nl();
  $$('[data-tijdbalk]').forEach(function(tb){
    var open=$('.tb-open',tb), st=$('.tb-status',tb), t=TIJD[nu.dag], h=nu.u+nu.m/60;
    if(t){open.style.setProperty('--van',t[0]);open.style.setProperty('--tot',t[1])}else{open.style.display='none'}
    tb.style.setProperty('--nu',h.toFixed(2));tb.querySelector('.tb-nu').style.setProperty('--nu',h.toFixed(2));tb.classList.add('met-nu');
    var hhmm=(nu.u<10?'0':'')+nu.u+':'+(nu.m<10?'0':'')+nu.m;
    var dagen=['zondag','maandag','dinsdag','woensdag','donderdag','vrijdag','zaterdag'];
    if(t&&h>=t[0]&&h<t[1]){st.innerHTML='Nu '+hhmm+': <b>open</b>, vandaag tot '+t[1]+':00.'}
    else{var vd=nu.dag,ex=0;if(t&&h<t[0]){ex=0}else{do{vd=(vd+1)%7;ex++}while(!TIJD[vd])}
      st.innerHTML='Nu '+hhmm+': gesloten. Weer open '+(ex===0?'vandaag':ex===1?'morgen':dagen[vd])+' vanaf 08:00.'}
  });
  $$('[data-week] .dag').forEach(function(r){if(parseInt(r.getAttribute('data-dag'),10)===nu.dag)r.classList.add('vandaag')});

  /* Werkwijze: op mobiel vult de tijdlijn tijdens het scrollen en lichten de stappen op */
  var lijn=$('.tijdlijn');
  if(lijn){
    var stp=$$('.stap',lijn);
    var mob=w.matchMedia('(max-width:640px)');
    if(rm){stp.forEach(function(s){s.classList.add('aan')});lijn.style.setProperty('--vul','1')}
    else{
      var loop=function(){if(!mob.matches){lijn.style.setProperty('--vul','1');stp.forEach(function(s){s.classList.add('aan')});return}
        var lr=lijn.getBoundingClientRect();var q=Math.max(0,Math.min(1,(w.innerHeight*.6-lr.top)/lr.height));lijn.style.setProperty('--vul',q.toFixed(3));stp.forEach(function(s){s.classList.toggle('aan',s.getBoundingClientRect().top<w.innerHeight*.6)})};
      w.addEventListener('scroll',function(){requestAnimationFrame(loop)},{passive:true});w.addEventListener('resize',loop);loop();
    }
  }

  /* Formulier: opent WhatsApp met een ingevuld bericht. Er wordt niets vanzelf verstuurd. Nummer: 06 44255227 ("Bel of app ons", achttotacht.nl). */
  var f=$('#berichtform');
  if(f){
    var NUM='31644255227';
    var soort='offerte', dienst='';
    var knopO=$('#s-offerte'), knopV=$('#s-vraag'), oms=$('#oms-label'), startVeld=$('#veld-start');
    var zetSoort=function(s){soort=s;knopO.setAttribute('aria-pressed',s==='offerte'?'true':'false');knopV.setAttribute('aria-pressed',s==='vraag'?'true':'false');oms.textContent=s==='offerte'?'Wat wilt u laten doen?':'Wat is uw vraag?';startVeld.hidden=(s!=='offerte')};
    knopO.addEventListener('click',function(){zetSoort('offerte')});knopV.addEventListener('click',function(){zetSoort('vraag')});
    var chips=$$('#chips button');
    var zetDienst=function(v){dienst=v;chips.forEach(function(c){c.setAttribute('aria-pressed',c.getAttribute('data-waarde')===v?'true':'false')})};
    chips.forEach(function(c){c.addEventListener('click',function(){var v=c.getAttribute('data-waarde');zetDienst(dienst===v?'':v)})});
    ['naam','tel'].forEach(function(k){f[k].addEventListener('input',function(){f[k].closest('.veld').classList.remove('mis')})});
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var ok=true;['naam','tel'].forEach(function(k){if(!f[k].value.trim()){f[k].closest('.veld').classList.add('mis');ok=false}});
      if(!ok){(f.naam.value.trim()?f.tel:f.naam).focus();return}
      var r=['Goedendag Acht tot Acht, '+(soort==='offerte'?'ik wil graag een offerte aanvragen.':'ik heb een vraag.')];
      if(dienst)r.push('Soort werk: '+dienst);
      r.push('Naam: '+f.naam.value.trim());r.push('Telefoon: '+f.tel.value.trim());
      if(f.plaats.value.trim())r.push('Postcode of plaats: '+f.plaats.value.trim());
      if(f.oms.value.trim())r.push((soort==='offerte'?'Wat ik wil laten doen: ':'Vraag: ')+f.oms.value.trim());
      if(soort==='offerte'&&f.start.value.trim())r.push('Gewenste start: '+f.start.value.trim());
      w.open('https://wa.me/'+NUM+'?text='+encodeURIComponent(r.join('\n')),'_blank','noopener');
    });
    /* CTA's vullen het formulier vooraf in */
    var vul=function(s,dn){zetSoort(s==='vraag'?'vraag':'offerte');if(dn){var c=chips.filter(function(c){return c.getAttribute('data-sleutel')===dn})[0];if(c)zetDienst(c.getAttribute('data-waarde'))}else{zetDienst('')}};
    $$('[data-soort]').forEach(function(a){a.addEventListener('click',function(){vul(a.getAttribute('data-soort'),a.getAttribute('data-dienst'))})});
    var q=new URLSearchParams(w.location.search);if(q.get('soort')||q.get('dienst'))vul(q.get('soort')||'offerte',q.get('dienst'));
  }
})();
