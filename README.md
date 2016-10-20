# eDom v 0.8.0

<details> 
  <summary>Reason Why</summary>   
[Reason Why](https://hackernoon.com/how-it-feels-to-learn-javascript-in-2016-d3a717dd577f?ref=mybridge.co#.8izemvqt6)
</details>
<details> 
  <summary>Причина по которой эта библиотека создана:</summary>   
[Почему это появилось](https://habrahabr.ru/post/312022/)
</details>

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

