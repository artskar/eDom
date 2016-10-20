# eDom

## Create virtualDom:
```
var newDOM = e$('DIV', {class: 'someClass', title:'someTitle'}, 
   e$('DIV', {class: 'someClass2', title:'someTitle2'}, 
      'someText'
   )
);
```

## Make `HTMLElem` it's eDom version:
```
var elem = e$('#item');
```

## Update 'HTMLElem' with new eDom:
```
elem.update(newDOM);
```

