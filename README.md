# eDom v 0.8.0

## Create virtualDOM you want to place:
```
var newDOM = e$('DIV', {class: 'someClass', title:'someTitle'}, 
   e$('DIV', {class: 'someClass2', title:'someTitle2'}, 
      'someText'
   )
);
```

## Make `HTMLElem` it's own eDom object:
```
var elem = e$('#item');
```

## Update `HTMLElem` with your new virtualDOM:
```
elem.eOut(newDOM);
```

