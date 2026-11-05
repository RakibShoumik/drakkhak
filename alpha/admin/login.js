(function(){
  var f=document.getElementById('loginForm'), err=document.getElementById('lerr'), go=document.getElementById('lgo');
  f.addEventListener('submit', function(e){
    e.preventDefault();
    err.hidden=true; go.disabled=true; go.textContent='Checking…';
    fetch('api.php?a=login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({user:document.getElementById('lu').value.trim(),pass:document.getElementById('lp').value})})
    .then(function(r){ return r.json(); })
    .then(function(o){
      if(o.ok){ location.reload(); return; }
      err.textContent=o.error||'Could not sign in.'; err.hidden=false;
      go.disabled=false; go.textContent='Sign in';
    })
    .catch(function(){
      err.textContent='Could not reach the server.'; err.hidden=false;
      go.disabled=false; go.textContent='Sign in';
    });
  });
})();
