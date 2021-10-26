
let btnOpen = document.querySelector("#open");
let btnClose = document.querySelector("#close");

let myTab;

btnOpen.addEventListener("click",function(){
    myTab = window.open("https://www.google.com.tw/?hl=zh_TW","_blank","height=500")
});

btnClose.addEventListener("click" , function(){
    if(myTab) myTab.close();
});