(function() {

    var all = 0;    
    var counter = document.querySelector('#counter');
    var yaCount =0;
    var noCount =0;
    var total = 0;
    var names = [];
    function updatecounter() {        
        --all;
        counter.innerHTML = all;
    }

    document.body.addEventListener('yepcard', function(ev) {
        yaCount++;        
        var fname1 = document.getElementsByName("fnamee")[0].value
        names.push(fname1); 
        //alert(fname1);  
        updatecounter();
    });

    document.body.addEventListener('nopecard', function(ev) {
        noCount++;
        updatecounter();
    });

    document.body.addEventListener('deckempty', function(ev) {
       if(noCount>0 && noCount == total){
           alert("sorry there are no more matches now");
       } 
       if(yaCount>0 && all==0){
        fetch('/liked', {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({liked: names })
        })
       }
    });

    window.addEventListener('load', function(ev) {      
        var listitems = document.body.querySelectorAll('.card');
        total=listitems.length;
        all = listitems.length + 1;
        updatecounter();
    });

})();