
//in this file we have made our own module for getting a date.
//module.exports="hello";(we can also ignore the "module")

//note: when this module will be required in the app.js file then it will
//pop up an object which will ontain keys as getdate and greet function.

exports.getdate=function() {
    let d = new Date();
    let options = {
        weekday: "long",
        day: "numeric",
        month: "long"

    };
   return d.toLocaleDateString("en-US", options); //hi-IN for hindi.
} 

//exporting a function.

exports.greet=function (){
    return "Good morning buddy!!!!";
}

