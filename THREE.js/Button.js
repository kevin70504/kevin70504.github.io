const btn2 = document.createElement("button");
btn2.innerHTML = "click";
btn2.name = "show";
btn2.addEventListener("click",function(){
    console.log(alert("本次使用"+planewidth*12+"個磁磚"));
});
document.body.appendChild(btn2);



