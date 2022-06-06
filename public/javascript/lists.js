
function Display(){
  
    let a=document.getElementById("lists");
    // console.log(a);

    console.log(a.style);

    if(a.style.display==="absolute"){
        a.style.display="none";
    }
    else{
        a.style.display="absolute";
    }
}
document.getElementById("listbutton").addEventListener("click",Display);
