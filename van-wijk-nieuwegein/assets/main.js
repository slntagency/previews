(function(){
  var d=document, w=window, rm=w.matchMedia('(prefers-reduced-motion: reduce)').matches;
  d.documentElement.classList.add('js');
  function $(s,c){return (c||d).querySelector(s)}
  function $$(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))}
  var IO='IntersectionObserver' in w;

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
    if(rm||!IO){rv.forEach(function(el){el.classList.add('zicht')})}
    else{
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('zicht');io.unobserve(e.target)}})},{rootMargin:'0px 0px -4% 0px'});
      rv.forEach(function(el){io.observe(el)});
      setTimeout(function(){rv.forEach(function(el){el.classList.add('zicht')})},4000);
    }
  }

  /* Tellers: de echte waarde staat in de HTML. Pas op 0 bij de start, na 1,5 s altijd de eindwaarde. */
  var tl=$$('[data-tel]');
  if(tl.length&&!rm&&IO){
    var start=function(el){var doel=parseFloat(el.getAttribute('data-tel'));var t0=Date.now();el.textContent='0';
      var stap=function(){var p=Math.min(1,(Date.now()-t0)/1200);el.textContent=String(Math.round(doel*(1-Math.pow(1-p,3))));if(p<1)requestAnimationFrame(stap)};
      requestAnimationFrame(stap);setTimeout(function(){el.textContent=String(doel)},1500)};
    var it=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){start(e.target);it.unobserve(e.target)}})},{threshold:.3});
    tl.forEach(function(el){it.observe(el)});
  }

  /* Fasebalk: ruiten verschijnen na elkaar, balken groeien. Vangnet: na 4 s altijd aan. */
  var fs=$('.fasen');
  if(fs){
    if(rm||!IO){fs.classList.add('aan')}
    else{
      var fo=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){fs.classList.add('aan');fo.disconnect()}})},{threshold:.1});
      fo.observe(fs);setTimeout(function(){fs.classList.add('aan')},4000);
    }
  }

  /* Parallax van de over-ons-foto: alleen transform, maximaal 24px. Nooit op kaarten. */
  var px=$$('[data-px]');
  if(px.length&&!rm){
    var tik=false;
    var doe=function(){px.forEach(function(el){var r=el.getBoundingClientRect();var m=(r.top+r.height/2-w.innerHeight/2);var y=Math.max(-24,Math.min(24,-m*.06));el.style.transform='translateY('+y.toFixed(1)+'px) scale(1.08)'});tik=false};
    w.addEventListener('scroll',function(){if(!tik){tik=true;requestAnimationFrame(doe)}},{passive:true});doe();
  }

  /* Tabs opdrachtgevers: radio's tonen het juiste paneel. #tab-id in de URL opent dat paneel. */
  var rad=$$('input[name="wie"]');
  if(rad.length){
    var toon=function(v){$$('.wie-paneel').forEach(function(p){p.classList.toggle('actief',p.id==='paneel-'+v)})};
    rad.forEach(function(r){r.addEventListener('change',function(){if(r.checked)toon(r.value)})});
    var h=(w.location.hash||'').replace('#','');
    var gekozen=rad.filter(function(r){return r.id===h||r.value===h})[0];
    if(gekozen){gekozen.checked=true;toon(gekozen.value)}
  }

  /* Openingstijden: vandaag markeren */
  var tb=$('.tijden');
  if(tb){var dag=new Date().getDay();var rij=$('tr[data-dag="'+dag+'"]',tb);if(rij)rij.classList.add('vandaag')}
})();
