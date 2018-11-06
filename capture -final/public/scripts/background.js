var counter = 0;

function changeBG(){
    var imgs = [
        "url('https://images.pexels.com/photos/1046896/pexels-photo-1046896.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')",
        "url('https://images.pexels.com/photos/443356/pexels-photo-443356.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940')",
        "url(https://images.pexels.com/photos/248159/pexels-photo-248159.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)",
        "url(https://images.pexels.com/photos/602607/pexels-photo-602607.png?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)",
        "url(https://images.pexels.com/photos/210012/pexels-photo-210012.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)",
        "url(https://images.pexels.com/photos/132037/pexels-photo-132037.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)",
        "url(https://images.pexels.com/photos/373912/pexels-photo-373912.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)",
        "url(https://images.pexels.com/photos/615060/pexels-photo-615060.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940)"
      ];
    
    if(counter === imgs.length) counter = 0;
    var body = document.getElementsByTagName("body")[0];
    body.style.backgroundImage = imgs[counter];

    counter++;
}
  
  setInterval(changeBG, 2000);